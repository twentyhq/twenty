import prompts, { PromptObject } from 'prompts';
import { askContributeLocalQuestions } from './local/index.js';
import { askContributeRemoteQuestions } from './remote.js';

export const contributeQuestions: PromptObject<string>[] = [
  {
    type: 'select',
    name: 'contribute_type',
    message: 'Where do you want to setup your development environment?',
    choices: [
      {
        title: 'Local',
        description: 'I want to setup a development environment on my machine',
        value: 'local',
      },
      {
        title: 'Remote (via Github Codespaces)',
        description: 'A simple pre-configured remote environment',
        value: 'remote',
      },
    ],
  },
];

export const askContributeQuestions: () => Promise<void> = async () => {
  const response = await prompts(contributeQuestions);
  switch (response.contribute_type) {
    case 'local':
      await askContributeLocalQuestions();
      break;
    case 'remote':
      await askContributeRemoteQuestions();
      break;
  }
};
