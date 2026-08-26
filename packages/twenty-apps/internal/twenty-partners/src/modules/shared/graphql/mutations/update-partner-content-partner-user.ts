import { type CoreApiClient } from 'twenty-client-sdk/core';

export function updatePartnerContentPartnerUser(client: CoreApiClient, id: string, partnerUserId: string) {
  return client.mutation({ updatePartnerContent: { __args: { id, data: { partnerUserId } }, id: true } });
}
