import type { CoreApiClient } from 'twenty-client-sdk/core';

export function getOpportunityCascadeFields(client: CoreApiClient, opportunityId: string) {
  return client.query({
    opportunity: {
      __args: { filter: { id: { eq: opportunityId } } },
      id: true,
      partnerUserId: true,
      companyId: true,
    },
  });
}
