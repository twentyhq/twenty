import prompts, { PromptObject } from 'prompts';

export const demoCloudQuestions: PromptObject<string>[] = [
  {
    type: 'select',
    name: 'signup_type',
    message: 'How do you want to signup?',
    choices: [
      { title: 'Google Sign-in', value: 'google' },
      { title: 'Email with magic link', value: 'magic_link' },
      { title: 'Email with password', value: 'password' },
    ],
  },
  {
    type: (rep) => (rep == 'google' ? 'text' : null),
    name: 'google_signup',
    message:
      'A new browser window will open to sign you up with Google. Press enter to continue.',
  },
  {
    type: (rep) => {
      if (rep == 'magic_link' || rep == 'password') {
        return 'text';
      }
    },
    name: 'email_signup',
    message: 'Please enter your email',
  },
];

export const askDemoCloudQuestions: () => Promise<void> = async () => {
  await prompts(demoCloudQuestions);
};
