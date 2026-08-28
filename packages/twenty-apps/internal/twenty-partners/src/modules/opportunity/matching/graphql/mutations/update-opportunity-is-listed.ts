import type { CoreApiClient } from 'twenty-client-sdk/core';

export function updateOpportunityIsListed(
  client: CoreApiClient,
  opportunityId: string,
  isListed: boolean,
) {
  return client.mutation({
    updateOpportunity: {
      __args: { id: opportunityId, data: { isListed } },
      id: true,
    },
  });
}
