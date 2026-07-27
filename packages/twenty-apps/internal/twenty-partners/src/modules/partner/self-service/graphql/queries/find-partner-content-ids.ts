import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerContentIds(client: CoreApiClient, partnerId: string) {
  return client.query({
    partnerContents: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: { node: { id: true, contentType: true } },
    },
  });
}
