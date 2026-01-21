import { defineFunction } from '@/application/functions/define-function';

const rootHandler = () => {
  return 'root-function-result';
};

export default defineFunction({
  universalIdentifier: 'f0f1f2f3-f4f5-4000-8000-000000000001',
  name: 'root-function',
  timeoutSeconds: 5,
  handler: rootHandler,
  triggers: [
    {
      universalIdentifier: 'f0f1f2f3-f4f5-4000-8000-000000000002',
      type: 'route',
      path: '/root',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
  ],
});
