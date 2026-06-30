import { defineLogicFunction } from 'twenty-sdk/define';

const handler = async (): Promise<{ message: string }> => {
  return { message: 'Hello, World!' };
};

export default defineLogicFunction({
  universalIdentifier: 'b05e4b30-72d4-4d7f-8091-32e037b601da',
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
