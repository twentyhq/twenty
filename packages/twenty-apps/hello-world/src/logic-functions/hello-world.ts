import { defineLogicFunction } from 'twenty-sdk';

const handler = async (): Promise<{ message: string }> => {
  return { message: 'Hello, World!' };
};

export default defineLogicFunction({
  universalIdentifier: '2baa26eb-9aaf-4856-a4f4-30d6fd6480ee',
  name: 'hello-world-logic-function',
  description: 'A simple logic function',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/hello-world-logic-function',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
