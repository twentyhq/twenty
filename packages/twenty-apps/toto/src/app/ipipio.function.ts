import { defineFunction } from 'twenty-sdk';
import Twenty from '../../generated';
import { toto } from '../utils/toto';

// Handler function - rename and implement your logic
export const handler = async (params: {
  a: string;
  b: number;
}): Promise<{ message: string }> => {
  const { a, b } = params;
  const client = new Twenty();
  // Replace with your own logic

  const message = `Hello, input: ${a} andc ${b} sdqsd`;

  return { message: toto() };
};

export default defineFunction({
  universalIdentifier: '83354491-426c-4f30-b813-f3610f2e085b',
  name: 'ipipio',
  description: 'Add a description for your function',
  timeoutSeconds: 5,
  handler,
  triggers: [
    // Add your triggers here
    // Route trigger example:
    // {
    //   universalIdentifier: 'aae4d022-1ee6-40cd-b36a-2a27e160ff33',
    //   type: 'route',
    //   path: '/ipipio',
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
