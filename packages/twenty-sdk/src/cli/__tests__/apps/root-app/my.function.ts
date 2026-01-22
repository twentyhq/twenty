import { defineFunction } from '@/application/functions/define-function';

const myHandler = () => {
  return 'my-function-result';
};

export default defineFunction({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000010',
  name: 'my-function',
  timeoutSeconds: 5,
  handler: myHandler,
  triggers: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000011',
      type: 'route',
      path: '/my-function',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
  ],
});
