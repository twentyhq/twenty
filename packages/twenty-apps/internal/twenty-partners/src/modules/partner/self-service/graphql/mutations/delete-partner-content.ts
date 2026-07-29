import { type CoreApiClient } from 'twenty-client-sdk/core';

export function deletePartnerContent(client: CoreApiClient, id: string) {
  return client.mutation({
    deletePartnerContent: { __args: { id }, id: true },
  });
}
