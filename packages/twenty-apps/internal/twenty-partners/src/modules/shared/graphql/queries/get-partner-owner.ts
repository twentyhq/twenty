import { type CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function getPartnerOwner(client: CoreApiClient, partnerId: string) {
  return client.query({
    partners: {
      __args: { filter: { id: { eq: partnerId } }, first: 1 },
      edges: { node: { id: true, partnerUserId: true } },
    },
  });
}
