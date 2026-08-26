import { type CoreApiClient } from 'twenty-client-sdk/core';

export function updatePartnerLinkPartnerUser(client: CoreApiClient, id: string, partnerUserId: string) {
  return client.mutation({ updatePartnerLink: { __args: { id, data: { partnerUserId } }, id: true } });
}
