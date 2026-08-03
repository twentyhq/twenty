import { type CoreApiClient } from 'twenty-client-sdk/core';

export function updateApplicationPartnerUser(client: CoreApiClient, id: string, partnerUserId: string) {
  return client.mutation({ updateApplication: { __args: { id, data: { partnerUserId } }, id: true } });
}
