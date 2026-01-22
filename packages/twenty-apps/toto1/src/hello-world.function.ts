import { defineFunction } from 'twenty-sdk';

const handler = async (): Promise<{ message: string }> => {
  return { message: 'Hello, World!' };
};

export default defineFunction({
  universalIdentifier: 'f84499d7-ceb6-421e-abc2-cbb028f9901c',
  name: 'hello-world-function',
  description: 'A sample serverless function',
  timeoutSeconds: 5,
  handler,
  triggers: [
    {
      universalIdentifier: 'dece9fac-bfc3-4177-b5b8-52a11fca3172',
      type: 'route',
      path: '/hello-world-function',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
  ],
});
