import { type CoreApiClient } from 'twenty-client-sdk/core';

const PAGE_SIZE = 200;

export function listApplicationsWithOpportunityPartnerUser(
  client: CoreApiClient,
  after?: string,
) {
  return client.query({
    applications: {
      __args: {
        first: PAGE_SIZE,
        ...(after ? { after } : {}),
      },
      edges: {
        node: { opportunityId: true, partnerUserId: true },
      },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });
}
