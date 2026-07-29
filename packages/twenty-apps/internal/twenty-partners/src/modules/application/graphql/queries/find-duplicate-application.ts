import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findDuplicateApplication(
  client: CoreApiClient,
  opportunityId: string,
  partnerId: string,
) {
  return client.query({
    applications: {
      __args: {
        filter: {
          opportunityId: { eq: opportunityId },
          partnerId: { eq: partnerId },
        },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });
}
