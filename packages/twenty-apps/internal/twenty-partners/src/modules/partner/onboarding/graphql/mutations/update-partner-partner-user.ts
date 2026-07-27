import { type CoreApiClient } from 'twenty-client-sdk/core';

export function updatePartnerPartnerUser(
  client: CoreApiClient,
  id: string,
  partnerUserId: string,
  partnerUserLinkedAt: string,
) {
  return client.mutation({
    updatePartner: { __args: { id, data: { partnerUserId, partnerUserLinkedAt } }, id: true },
  });
}
