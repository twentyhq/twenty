import { defineLogicFunction } from '@/sdk';
import { formatFarewell } from '../utils/greeting.util';

const handler = () => {
  return formatFarewell('test');
};

export default defineLogicFunction({
  universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
  name: 'test-function',
  timeoutSeconds: 2,
  handler,
  httpRouteTriggerSettings: {
    path: '/post-card/create',
    httpMethod: 'GET',
    isAuthRequired: false,
    forwardedRequestHeaders: ['signature'],
  },
});
