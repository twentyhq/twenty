import prompts, { PromptObject } from 'prompts';
import { askDemoCloudQuestions } from './cloud.js';
import { askDemoDockerQuestions } from './docker.js';

export const demoQuestions: PromptObject<string>[] = [
  {
    type: 'select',
    name: 'demo_type',
    message: 'How do you want to try the app?',
    choices: [
      { title: 'Cloud demo', value: 'cloud' },
      { title: 'Local docker image', value: 'docker' },
    ],
  },
];

export const askDemoQuestions: () => Promise<void> = async () => {
  const response = await prompts(demoQuestions);
  switch (response.demo_type) {
    case 'cloud':
      await askDemoCloudQuestions();
      break;
    case 'docker':
      await askDemoDockerQuestions();
      break;
  }
};
