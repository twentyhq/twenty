import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

type Payload = { id?: string };

const handler = async (event: RoutePayload<Payload>) => {
  const client = new CoreApiClient();

  const result = await client.query({
    people: {
      __args: { filter: { id: { eq: event.body?.id ?? '' } } },
      edges: { node: { id: true } },
    },
  });

  return { count: result.people?.edges.length ?? 0 };
};

export default defineLogicFunction({
  universalIdentifier: '22222222-2222-4222-8222-222222222222',
  name: 'with-sdk-client',
  description: 'Logic function that calls the Twenty CoreApiClient',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/bundle-investigation/with-sdk-client',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
