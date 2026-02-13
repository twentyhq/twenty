import { defineLogicFunction } from '@/sdk';

const myHandler = () => {
  return 'my-function-result';
};

export default defineLogicFunction({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000010',
  name: 'my-function',
  timeoutSeconds: 5,
  handler: myHandler,
  httpRouteTriggerSettings: {
    path: '/my-function',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
