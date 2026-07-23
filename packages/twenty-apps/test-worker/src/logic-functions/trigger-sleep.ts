import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const DEFAULT_TRIGGER_COUNT = 10;
const CREATE_BATCH_SIZE = 50;

const handler = async (params: {
  count?: number;
  body?: { count?: number } | null;
}): Promise<{ created: number }> => {
  const count = params?.count ?? params?.body?.count ?? DEFAULT_TRIGGER_COUNT;

  const client = new CoreApiClient();

  let created = 0;

  while (created < count) {
    const batchSize = Math.min(CREATE_BATCH_SIZE, count - created);

    await client.mutation({
      createTriggers: {
        __args: {
          data: Array.from({ length: batchSize }, () => ({
            name: `Trigger ${Math.random().toString(36).slice(2, 8)}`,
          })),
        },
        id: true,
      },
    });

    created += batchSize;
  }

  return { created };
};

export default defineLogicFunction({
  universalIdentifier: '1e5327ce-1646-4923-8609-9bb6e2edcd60',
  name: 'trigger-sleep',
  description:
    'Creates N trigger records (default 10); each one enqueues a sleep job on the logic function queue',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/trigger-sleep',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
