import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findOpportunityForApply(client: CoreApiClient, opportunityId: string) {
  return client.query({
    opportunity: {
      __args: { filter: { id: { eq: opportunityId } } },
      id: true,
      name: true,
      isListed: true,
    },
  });
}
