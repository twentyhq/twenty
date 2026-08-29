import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerServiceRows(client: CoreApiClient, partnerId: string) {
  return client.query({
    partnerServices: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: {
        node: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
        },
      },
    },
  });
}
