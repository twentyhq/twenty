import { defineLogicFunction } from '@/sdk';

const addNumbersHandler = (payload: { a: number; b: number }) => {
  const result = payload.a + payload.b;

  console.log(`Adding ${payload.a} + ${payload.b} = ${result}`);

  return result;
};

export default defineLogicFunction({
  universalIdentifier: 'a1b2c3d4-e5f6-4000-8000-000000000010',
  name: 'add-numbers',
  timeoutSeconds: 5,
  handler: addNumbersHandler,
  httpRouteTriggerSettings: {
    path: '/add-numbers',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
