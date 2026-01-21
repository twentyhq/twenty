import { defineFunction } from '@/application/functions/define-function';
import { DEFAULT_NAME, formatGreeting } from '../utils/greeting.util';

const greetingHandler = () => {
  return formatGreeting(DEFAULT_NAME);
};

export default defineFunction({
  universalIdentifier: 'g0g1g2g3-g4g5-4000-8000-000000000001',
  name: 'greeting-function',
  timeoutSeconds: 5,
  handler: greetingHandler,
  triggers: [
    {
      universalIdentifier: 'g0g1g2g3-g4g5-4000-8000-000000000002',
      type: 'route',
      path: '/greet',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
  ],
});
