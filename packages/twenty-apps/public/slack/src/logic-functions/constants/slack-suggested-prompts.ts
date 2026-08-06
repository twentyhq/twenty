export const SLACK_SUGGESTED_PROMPTS_TITLE = 'Ask me about your CRM';

export const SLACK_SUGGESTED_PROMPTS: { title: string; message: string }[] = [
  {
    title: 'Review the pipeline',
    message: 'How many open opportunities are in the pipeline, by stage?',
  },
  {
    title: 'Spot the biggest deals',
    message: 'What are our five biggest open opportunities and who owns them?',
  },
  {
    title: 'Catch up on changes',
    message: 'What changed in the CRM this week?',
  },
  {
    title: 'Create a task',
    message: 'Create a task for me to follow up with our newest company next week.',
  },
];
