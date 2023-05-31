import prompts, { PromptObject } from 'prompts';

export const demoDockerQuestions: PromptObject<string>[] = [
  {
    type: 'select',
    name: 'yyy',
    message: 'xxx',
    choices: [{ title: 'zzz', value: 'zz' }],
  },
];

export const askDemoDockerQuestions: () => Promise<void> = async () => {
  await prompts(demoDockerQuestions);
};
