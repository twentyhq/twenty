import { type CoreApiClient } from 'twenty-client-sdk/core';

export function updatePartnerServicePartnerUser(client: CoreApiClient, id: string, partnerUserId: string) {
  return client.mutation({ updatePartnerService: { __args: { id, data: { partnerUserId } }, id: true } });
}
