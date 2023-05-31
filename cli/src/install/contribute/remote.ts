import prompts, { PromptObject } from 'prompts';
import open from 'open';

export const contributeRemoteQuestions: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'local_setup_type',
    message:
      "We'll be redirecting you to a dedicated Github Codespace. Press enter to continue.",
  },
];

export const askContributeRemoteQuestions: () => Promise<void> = async () => {
  await prompts(contributeRemoteQuestions);
  await open('https://codespaces.new/twentyhq/twenty');
};
