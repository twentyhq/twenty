import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import type {
  DatabaseEventPayload,
  ObjectRecordCreateEvent,
} from 'twenty-sdk/logic-function';

const handler = async (
  event: DatabaseEventPayload<ObjectRecordCreateEvent<{ name: string }>>,
): Promise<{ message: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 20_000));

  const client = new CoreApiClient();

  await client.mutation({
    updateTrigger: {
      __args: {
        id: event.recordId,
        data: { name: `${event.properties.after.name} - done` },
      },
      id: true,
      name: true,
    },
  });

  return { message: 'Slept for 20 seconds' };
};

export default defineLogicFunction({
  universalIdentifier: 'b9a308da-bfd0-4fb5-801e-b14545803396',
  name: 'sleep',
  description:
    'Sleeps 20 seconds when a trigger record is created, then marks it done',
  timeoutSeconds: 40,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'trigger.created',
  },
});
