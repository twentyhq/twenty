import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerServiceIds(client: CoreApiClient, partnerId: string) {
  return client.query({
    partnerServices: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: { node: { id: true } },
    },
  });
}
