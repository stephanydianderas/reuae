// interactions.js — scroll progress, reveal, nav, cursor, stats counter, mobile menu

(function () {
  'use strict';

  // ===== CUSTOM CURSOR =====
  var cursorDot = document.getElementById('cursorDot');
  var mouseX = 0, mouseY = 0;
  var dotX = 0, dotY = 0;
  var cursorRAF;

  function lerpCursor() {
    dotX += (mouseX - dotX) * 0.18;
    dotY += (mouseY - dotY) * 0.18;
    if (cursorDot) {
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
    }
    cursorRAF = requestAnimationFrame(lerpCursor);
  }

  if (window.matchMedia('(hover: hover)').matches && cursorDot) {
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    lerpCursor();

    // Expand on interactive elements
    document.querySelectorAll('a, button, .vcard, .mcard, .tcard, .copcion').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorDot.classList.add('expanded');
      });
      el.addEventListener('mouseleave', function () {
        cursorDot.classList.remove('expanded');
      });
    });
  }

  // ===== SCROLL PROGRESS =====
  var progressBar = document.getElementById('scrollProgress');

  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
  }

  // ===== NAV =====
  var nav = document.getElementById('mainNav');

  function updateNav() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  // ===== SCROLL REVEAL =====
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // ===== STAT COUNTER =====
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var dur = 2000;
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(eased * target).toLocaleString('es-ES');
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var statEls = document.querySelectorAll('.hstat-num[data-count]');
  var statsStarted = false;

  function checkStats() {
    if (statsStarted) return;
    var statsEl = document.querySelector('.hero-stats');
    if (!statsEl) return;
    if (statsEl.getBoundingClientRect().top < window.innerHeight * 0.92) {
      statsStarted = true;
      statEls.forEach(animateCounter);
    }
  }

  // ===== MOBILE MENU =====
  var navToggle  = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!mobileMenu || !navToggle) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.contains('open');
      if (open) {
        closeMenu();
      } else {
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var offset = (nav ? nav.offsetHeight : 68) + 12;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });

  // ===== ACTIVE NAV LINKS =====
  var sections  = document.querySelectorAll('section[id]');
  var navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    var mid = window.scrollY + window.innerHeight * 0.4;
    var current = '';
    sections.forEach(function (s) {
      if (s.offsetTop <= mid) current = s.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href').slice(1) === current);
    });
  }

  // ===== CARD MOUSE GRADIENT =====
  document.querySelectorAll('.vcard, .tcard').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top)  / rect.height * 100) + '%');
    });
  });

  // ===== FOOTER YEAR =====
  var yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== SCROLL HANDLER =====
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgress();
        updateNav();
        checkStats();
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Llamadas iniciales
  updateProgress();
  updateNav();
  checkStats();
  updateActiveLink();

  // ===== TOAST HELPER =====
  window.showToast = function (title, msg) {
    var id = 'globalToast';
    var toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = id;
      toast.className = 'toast';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = '<span class="toast-title"></span><span class="toast-msg"></span>';
      document.body.appendChild(toast);
    }
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-msg').textContent   = msg;
    toast.classList.remove('hide');
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(function () {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(function () { toast.classList.remove('hide'); }, 400);
    }, 4500);
  };

  // ===== RESIZE =====
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });

})();
