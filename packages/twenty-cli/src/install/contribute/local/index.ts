import prompts, { PromptObject } from 'prompts';
import { askDockerQuestions } from './docker.js';
import { askNoDockerQuestions } from './no-docker.js';

export const contributeLocalQuestions: PromptObject<string>[] = [
  {
    type: 'select',
    name: 'local_setup_type',
    message: 'What is your prefered setup?',
    choices: [
      {
        title: 'Docker',
        description: 'A managed development environment with Postgres included',
        value: 'docker',
      },
      {
        title: 'Without docker',
        description: "You'll need to setup a Postgres instance on your own",
        value: 'no-docker',
      },
    ],
  },
];

export const askContributeLocalQuestions: () => Promise<void> = async () => {
  const response = await prompts(contributeLocalQuestions);
  switch (response.local_setup_type) {
    case 'docker':
      await askDockerQuestions();
      break;
    case 'no-docker':
      await askNoDockerQuestions();
      break;
  }
};
