import prompts, { PromptObject } from 'prompts';
import open from 'open';

export const selfhostQuestions: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'docker',
    message:
      'The options to self-host are documented in the doc. Click enter to open the relevant help page.',
  },
];

export const askSelfhostQuestions: () => Promise<void> = async () => {
  await prompts(selfhostQuestions);
  await open('https://docs.twenty.com/dev-docs/getting-started/self-hosting');
};
