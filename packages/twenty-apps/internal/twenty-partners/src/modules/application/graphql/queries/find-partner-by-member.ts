import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerByMember(client: CoreApiClient, memberId: string) {
  return client.query({
    partners: {
      __args: { filter: { partnerUserId: { eq: memberId } }, first: 1 },
      edges: { node: { id: true } },
    },
  });
}
