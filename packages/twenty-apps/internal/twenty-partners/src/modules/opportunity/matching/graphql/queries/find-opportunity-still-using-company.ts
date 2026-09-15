import type { CoreApiClient } from 'twenty-client-sdk/core';

export function findOpportunityStillUsingCompany(
  client: CoreApiClient,
  params: {
    companyId: string;
    removedPartnerId: string | null | undefined;
    removedMemberId: string;
  },
) {
  const { companyId, removedPartnerId, removedMemberId } = params;
  return client.query({
    opportunities: {
      __args: {
        filter: {
          companyId: { eq: companyId },
          ...(removedPartnerId
            ? { partnerId: { eq: removedPartnerId } }
            : { partnerUserId: { eq: removedMemberId } }),
        },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });
}
