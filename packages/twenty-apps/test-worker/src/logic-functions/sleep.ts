import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const handler = async (): Promise<{
  message: string;
  triggerName: string;
}> => {
  await new Promise((resolve) => setTimeout(resolve, 20_000));

  const triggerName = `Trigger ${Math.random().toString(36).slice(2, 8)}`;

  const client = new CoreApiClient();

  await client.mutation({
    createTrigger: {
      __args: { data: { name: triggerName } },
      id: true,
      name: true,
    },
  });

  return { message: 'Slept for 20 seconds', triggerName };
};

export default defineLogicFunction({
  universalIdentifier: 'b9a308da-bfd0-4fb5-801e-b14545803396',
  name: 'sleep',
  description: 'Sleeps 20 seconds then returns',
  timeoutSeconds: 40,
  handler,
  httpRouteTriggerSettings: {
    path: '/sleep',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
