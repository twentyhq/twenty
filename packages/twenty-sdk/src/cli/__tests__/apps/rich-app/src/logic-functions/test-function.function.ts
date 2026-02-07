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
  trigger: {
    universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
    type: 'route',
    path: '/post-card/create',
    httpMethod: 'GET',
    isAuthRequired: false,
    forwardedRequestHeaders: ['signature'],
  },
});
