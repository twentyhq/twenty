import { type CoreApiClient } from 'twenty-client-sdk/core';

export function listApplicationsWithOpportunityPartnerUser(
  client: CoreApiClient,
  after?: string,
) {
  return client.query({
    applications: {
      __args: {
        first: 200,
        ...(after ? { after } : {}),
      },
      edges: {
        node: { id: true, opportunityId: true, partnerUserId: true },
      },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });
}
