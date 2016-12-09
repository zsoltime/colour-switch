'use strict';

const Game = (function() {

  const color = Color();
  const dom = {};
  let level = 1;
  let score = 0;
  let current = '';
  let timer;
  let timerIncrement = 800;
  let opacity = 0.5;

  function init() {
    cacheDOM();
    bindEvents();
    current = color.random();
    render();
    timer = new Timer(dom.timer, 20000);
  }

  function cacheDOM() {
    dom.info = document.getElementById('info');
    dom.modal = document.getElementById('modal');
    dom.game = document.getElementById('game');
    dom.start = document.getElementById('start');
    dom.dark = document.getElementById('dark');
    dom.timer = document.getElementById('timer');
    dom.score = document.getElementById('score');
    dom.level = document.getElementById('level');
  }

  function bindEvents() {
    dom.game.addEventListener('click', isCorrect);
    dom.start.addEventListener('click', start);
  }

  function render() {
    switchSides();
    document.body.style.backgroundColor = current;
    dom.score.textContent = score;
    dom.level.textContent = level;
  }

  function start() {
    // should I reset on gameover?
    if (score > 0) {
      reset();
      render();
    }

    toggle(dom.modal);
    timer.wait(1000)
    .then(_ => toggle(dom.game))
    .then(_ => timer.start())
    .then(_ => gameover());
  }

  function gameover() {
    dom.modal.getElementsByTagName('h1')[0].innerHTML = 'Game<span>/</span><span>Over</span>';
    dom.modal.getElementsByClassName('results')[0].innerHTML = '<span>Score: ' + score + '</span><span>Level: ' + level + '</span>';
    toggle(dom.game);
    timer.wait(100)
    .then(_ => toggle(dom.modal))
    .then(_ => timer.reset());
  }

  function reset() {
    level = 1;
    score = 0;
    current = color.random();
    timerIncrement = 800;
    opacity = 0.5;
    dom.dark.style.opacity = opacity;
  }

  function switchSides() {
    if (Math.random() > .5) {
      dom.dark.style.marginLeft = '50%';
    }
    else {
      dom.dark.style.marginLeft = '0';
    }
  }

  function isCorrect(event) {
    // shouldn't check the DOM, should check a boolean instead
    if (!dom.game.classList.contains('active')) {
      return;
    }

    if (event.target.id === 'dark') {
      score += level;
      incrementLevel();
      current = color.random();
      timer.increment(timerIncrement);
      render();
    }
    else {
      gameover();
    }
  }

  function incrementLevel() {
    if (score % 15 === 0) {
      nextLevel();
    }
  }

  function nextLevel() {
    level += 1;
    // bonus
    timer.increment(1000);

    if (opacity > 0.1) {
      opacity = parseFloat(opacity - 0.05).toFixed(4);
    }
    else if (opacity > 0.05) {
      opacity = parseFloat(opacity - 0.005).toFixed(4);
    }
    else if (opacity > 0.02) {
      opacity = parseFloat(opacity - 0.0025).toFixed(4);
    }

    if (timerIncrement > 500) {
      timerIncrement -= 100;
    }
    else if (timerIncrement > 200) {
      timerIncrement -= 75;
    }
    else if (timerIncrement > 100) {
      timerIncrement -= 25;
    }

    dom.dark.style.opacity = opacity;
  }

  function toggle(elem) {
    elem.classList.toggle('active');
  }

  return {
    init: init
  }
})();

function Timer(elem, time) {
  let id = 0;
  let total = time;
  let remaining = time;
  let interval = 100;

  function incrementTime(by) {
    remaining += by;
  }

  function start() {
    return new Promise((resolve, reject) => {
      elem.style.transitionDuration = interval + 'ms';

      id = setInterval(function() {
        incrementTime(-interval);
        setTimerWidth();

        if (isDone()) {
          reset();
          return resolve();
        }
      }, interval);
    });
  }

  function stop() {
    clearInterval(id);
  }

  function reset() {
    stop();
    remaining = time;
    setTimerWidth();
  }

  function wait(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  }

  function setTimerWidth() {
    if (!elem) {
      return false;
    }
    elem.style.width = (remaining / total) * 50 + '%';
  }

  function isDone() {
    return remaining <= 0;
  }

  return {
    start: start,
    stop: stop,
    reset: reset,
    wait: wait,
    increment: incrementTime
  }
}

function Color() {
  function randomRGB() {
    // should work with hsl and limit saturation?
    let hex = (Math.random()*0xFFFFFF<<0).toString(16);

    if (hex.length === 6) {
      return '#' + hex;
    }
    randomRGB();
  }

  return {
    random: randomRGB
  }
}

document.addEventListener("DOMContentLoaded", function(e) {
  Game.init();
});
