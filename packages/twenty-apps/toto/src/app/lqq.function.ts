import { defineFunction } from 'twenty-sdk';
import Twenty from '../../generated';
import { toto } from '../utils/toto';

// Handler function - rename and implement your logic
export const handler = async (params: {
  a: string;
  b: number;
}): Promise<{ message: string }> => {
  const { a, b } = params;
  const twenty = new Twenty();
  const { companies } = await twenty.query({
    companies: { edges: { node: { id: true, name: true } } },
  });
  // Replace with your own logic
  const message = `Hello, input: ${a} and ${b}`;

  return { message: toto() };
};

export default defineFunction({
  universalIdentifier: '2157dc18-2d1c-404a-a6ec-f3c0c454d58f',
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
