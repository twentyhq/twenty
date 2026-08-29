import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerContentOwner(client: CoreApiClient, recordId: string) {
  return client.query({
    partnerContents: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: { node: { partnerId: true, status: true } },
    },
  });
}
