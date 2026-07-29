import { type CoreApiClient } from 'twenty-client-sdk/core';

export function deletePartnerLink(client: CoreApiClient, id: string) {
  return client.mutation({
    deletePartnerLink: { __args: { id }, id: true },
  });
}
