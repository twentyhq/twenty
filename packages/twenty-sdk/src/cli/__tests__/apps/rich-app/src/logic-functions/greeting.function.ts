import { defineLogicFunction } from '@/sdk';
import { DEFAULT_NAME, formatGreeting } from '../utils/greeting.util';

const greetingHandler = () => {
  return formatGreeting(DEFAULT_NAME);
};

export default defineLogicFunction({
  universalIdentifier: '9d412d9e-2caf-487c-8b66-d1585883dd4e',
  name: 'greeting-function',
  timeoutSeconds: 5,
  handler: greetingHandler,
  httpRouteTriggerSettings: {
    path: '/greet',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
