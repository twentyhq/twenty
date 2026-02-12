import { defineLogicFunction } from '@/sdk';
import { testFunction2 } from '../utils/test-function-2.util';

export default defineLogicFunction({
  universalIdentifier: 'eb3ffc98-88ec-45d4-9b4a-56833b219ccb',
  name: 'test-function-2',
  timeoutSeconds: 2,
  handler: testFunction2,
  cronTriggerSettings: {
    pattern: '0 0 1 1 *',
  },
});
