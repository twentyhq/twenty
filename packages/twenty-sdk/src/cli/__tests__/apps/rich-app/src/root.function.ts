import { defineLogicFunction } from '@/sdk';

const rootHandler = () => {
  return 'root-function-result';
};

export default defineLogicFunction({
  universalIdentifier: 'f0f1f2f3-f4f5-4000-8000-000000000001',
  name: 'root-function',
  timeoutSeconds: 5,
  handler: rootHandler,
  httpRouteTriggerSettings: {
    path: '/root',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
