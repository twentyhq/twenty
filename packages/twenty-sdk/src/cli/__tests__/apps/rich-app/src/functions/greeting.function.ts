import { defineFunction } from '@/application/functions/define-function';
import { DEFAULT_NAME, formatGreeting } from '../utils/greeting.util';

const greetingHandler = () => {
  return formatGreeting(DEFAULT_NAME);
};

export default defineFunction({
  universalIdentifier: '9d412d9e-2caf-487c-8b66-d1585883dd4e',
  name: 'greeting-function',
  timeoutSeconds: 5,
  handler: greetingHandler,
  triggers: [
    {
      universalIdentifier: 'f7b12160-3d25-4c92-a13f-a325dd60eb04',
      type: 'route',
      path: '/greet',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
  ],
});
