import { defineLogicFunction } from 'twenty-sdk/define';

export default defineLogicFunction({
  universalIdentifier: 'a1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'dispatch-nightly-sync',
  timeoutSeconds: 5,
  serverCronTriggerSettings: {
    pattern: '0 3 * * *',
  },
  handler: async () => ({ dispatches: [] }),
});
