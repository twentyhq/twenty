import { defineLogicFunction } from '@/sdk';

const handler = async () => {
  return { processed: true };
};

export default defineLogicFunction({
  universalIdentifier: 'a1b2c3d4-db01-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'on-post-card-created',
  description: 'Triggered when a new post card is created',
  timeoutSeconds: 5,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'postCard.created',
  },
});
