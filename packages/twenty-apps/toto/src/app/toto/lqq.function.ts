import { defineFunction } from 'twenty-sdk';
import Twenty from '../../../generated';

// Handler function - rename and implement your logic
export const handler = async (params: {
  a: string;
  b: number;
}): Promise<{ message: string }> => {
  const { a, b } = params;
  const client = new Twenty();

  // Replace with your own logic
  const message = `Hello, input: ${a} and ${b}`;

  return { message };
};

export default defineFunction({
  universalIdentifier: 'be3e335c-7f6f-46ae-a8e6-ae1b5e853374',
  name: 'lqq',
  description: 'Add a description for your function',
  timeoutSeconds: 5,
  handler,
  triggers: [
    // Add your triggers here
    // Route trigger example:
    // {
    //   universalIdentifier: 'd47a39cd-5701-48fd-b2fe-71d120bd3715',
    //   type: 'route',
    //   path: '/lqq',
    //   httpMethod: 'POST',
    //   isAuthRequired: true,
    // },
    // Cron trigger example:
    // {
    //   universalIdentifier: '...',
    //   type: 'cron',
    //   pattern: '0 0 * * *', // Daily at midnight
    // },
    // Database event trigger example:
    // {
    //   universalIdentifier: '...',
    //   type: 'databaseEvent',
    //   eventName: 'objectName.created',
    // },
  ],
});
