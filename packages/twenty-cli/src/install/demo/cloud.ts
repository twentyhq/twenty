import prompts, { PromptObject } from 'prompts';
import open from 'open';

export const demoCloudQuestions: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'continue_cloud',
    message: 'We will redirect your to the cloud app. Press enter to continue.',
  },
  /*
  In the future we can let user signup from CLI directly before redirecting:
  {
    type: 'select',
    name: 'signup_type',
    message: 'How do you want to signup?',
    choices: [
      { title: 'Google Sign-in', value: 'google' },
      { title: 'Email with magic link', value: 'magic_link' },
      { title: 'Email with password', value: 'password' },
      { title: 'No-email, demo account with seeds', value: 'seeded_demo' },
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
  }, */
];

export const askDemoCloudQuestions: () => Promise<void> = async () => {
  await prompts(demoCloudQuestions);
  open('https://app.twenty.com');
};
