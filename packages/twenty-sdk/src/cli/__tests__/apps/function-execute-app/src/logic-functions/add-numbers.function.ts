import { defineLogicFunction } from '@/sdk';

export const ADD_NUMBERS_UNIVERSAL_IDENTIFIER =
  'f9e5589c-e951-4d99-85db-0a305ab53502';

const addNumbersHandler = (payload: { a: number; b: number }) => {
  const result = payload.a + payload.b;

  console.log(`Adding ${payload.a} + ${payload.b} = ${result}`);

  return result;
};

export default defineLogicFunction({
  universalIdentifier: ADD_NUMBERS_UNIVERSAL_IDENTIFIER,
  name: 'add-numbers',
  timeoutSeconds: 5,
  handler: addNumbersHandler,
  httpRouteTriggerSettings: {
    path: '/add-numbers',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
