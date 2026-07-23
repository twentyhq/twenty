import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const handler = async (): Promise<{ deleted: number }> => {
  const client = new CoreApiClient();

  let deleted = 0;

  while (true) {
    const result = await client.query({
      triggers: {
        edges: {
          node: { id: true },
        },
      },
    });

    const ids = (result.triggers?.edges ?? []).map((edge) => edge.node.id);

    if (ids.length === 0) {
      break;
    }

    await client.mutation({
      deleteTriggers: {
        __args: { filter: { id: { in: ids } } },
        id: true,
      },
    });

    deleted += ids.length;
  }

  return { deleted };
};

export default defineLogicFunction({
  universalIdentifier: '45b10c33-f3cf-4c21-bf0a-d39d9565aa75',
  name: 'delete-triggers',
  description: 'Deletes all trigger records',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/delete-triggers',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
