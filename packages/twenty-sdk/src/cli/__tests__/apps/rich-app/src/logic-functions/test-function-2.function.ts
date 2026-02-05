import { defineLogicFunction } from '@/sdk';
import { testFunction2 } from '../utils/test-function-2.util';

export default defineLogicFunction({
  universalIdentifier: 'eb3ffc98-88ec-45d4-9b4a-56833b219ccb',
  name: 'test-function-2',
  timeoutSeconds: 2,
  handler: testFunction2,
  triggers: [
    {
      universalIdentifier: '9fd0dda9-4664-4fbc-9656-509f4477b9ff',
      type: 'cron',
      pattern: '0 0 1 1 *',
    },
  ],
});
