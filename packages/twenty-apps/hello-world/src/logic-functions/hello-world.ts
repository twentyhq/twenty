import { defineLogicFunction } from 'twenty-sdk';

const handler = async (): Promise<{ message: string }> => {
  return { message: 'Hello, World!' };
};

export default defineLogicFunction({
  universalIdentifier: '4f0b7137-1399-4e50-ac00-3c3bb2555c38',
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
