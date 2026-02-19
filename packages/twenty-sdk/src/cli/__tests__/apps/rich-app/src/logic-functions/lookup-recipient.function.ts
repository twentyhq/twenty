import { defineLogicFunction } from '@/sdk';

const handler = async (params: { recipientName: string }) => {
  return { found: true, name: params.recipientName };
};

export default defineLogicFunction({
  universalIdentifier: 'a1b2c3d4-1001-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'lookup-recipient',
  description: 'Look up a recipient by name to find their details',
  timeoutSeconds: 5,
  handler,
  isTool: true,
});
