import type { CoreApiClient } from 'twenty-client-sdk/core';

const APPLICATIONS_PAGE_SIZE = 200;

export function listApplicationsByOpportunity(
  client: CoreApiClient,
  opportunityId: string,
  after?: string,
) {
  return client.query({
    applications: {
      __args: {
        filter: { opportunityId: { eq: opportunityId } },
        first: APPLICATIONS_PAGE_SIZE,
        ...(after ? { after } : {}),
      },
      edges: { node: { id: true, partnerId: true, state: true } },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });
}
