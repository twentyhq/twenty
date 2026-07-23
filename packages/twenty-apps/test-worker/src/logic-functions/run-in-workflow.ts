import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const handler = async (): Promise<{ triggerName: string }> => {
  const triggerName = `Workflow trigger ${Math.random().toString(36).slice(2, 8)}`;

  const client = new CoreApiClient();

  await client.mutation({
    createTrigger: {
      __args: { data: { name: triggerName } },
      id: true,
      name: true,
    },
  });

  return { triggerName };
};

export default defineLogicFunction({
  universalIdentifier: '85fd2022-cb22-466a-b5fc-0c4403b8f898',
  name: 'run-in-workflow',
  description:
    'Creates a trigger when a workflowRunTrigger record is created',
  timeoutSeconds: 5,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'workflowRunTrigger.created',
  },
});
