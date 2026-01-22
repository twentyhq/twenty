import { defineFunction } from 'twenty-sdk';

const handler = async (): Promise<{ message: string }> => {
  return { message: 'Hello, World!' };
};

export default defineFunction({
  universalIdentifier: '6e47cc1b-c3f3-45e2-91a1-e15dab36c812',
  name: 'hello-world-function',
  description: 'A sample serverless function',
  timeoutSeconds: 5,
  handler,
  triggers: [
    {
      universalIdentifier: '2a4733cc-fcdf-4a5d-a124-ca572c711a0c',
      type: 'route',
      path: '/hello-world-function',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
  ],
});
