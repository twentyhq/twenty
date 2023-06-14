import prompts, { PromptObject } from 'prompts';

export const demoDockerQuestions: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'not_ready_yet',
    message: 'Not yeady yet',
    choices: [{ title: 'XXX', value: 'XXX' }],
  },
];

export const askDemoDockerQuestions: () => Promise<void> = async () => {
  await prompts(demoDockerQuestions);
};
