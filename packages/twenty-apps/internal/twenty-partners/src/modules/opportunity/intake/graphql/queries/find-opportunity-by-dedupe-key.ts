import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

export function findOpportunityByDedupeKey(
  client: CoreApiClient,
  filter: CoreSchema.OpportunityFilterInput,
) {
  return client.query({
    opportunities: {
      __args: { filter, first: 1 },
      edges: { node: { id: true } },
    },
  });
}
