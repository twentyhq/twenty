import { defineLogicFunction } from 'twenty-sdk';

const handler = async (): Promise<{ message: string }> => {
  return { message: 'Hello, World!' };
};

export default defineLogicFunction({
  universalIdentifier: 'ea5b3bbd-a8c3-48ed-880e-a0d062588f53',
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
