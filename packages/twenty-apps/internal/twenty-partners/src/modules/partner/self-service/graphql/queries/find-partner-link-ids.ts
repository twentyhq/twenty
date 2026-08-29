import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerLinkIds(client: CoreApiClient, partnerId: string) {
  return client.query({
    partnerLinks: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: { node: { id: true } },
    },
  });
}
