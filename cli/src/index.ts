#!/usr/bin/env node
import { program } from 'commander';
import { showWelcomeScreen, firstQuestion } from './install/index.js';
import prompts from 'prompts';
import { askContributeQuestions } from './install/contribute/index.js';
import { askDemoQuestions } from './install/demo/index.js';
import { askSelfhostQuestions } from './install/selfhost/index.js';

program;

showWelcomeScreen();

(async () => {
  const response = await prompts(firstQuestion);

  switch (response.install_type) {
    case 'contribute':
      askContributeQuestions();
      break;
    case 'demo':
      askDemoQuestions();
      break;
    case 'selfhost':
      askSelfhostQuestions();
      break;
  }
})();
