import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

export function updatePartnerLink(
  client: CoreApiClient,
  id: string,
  data: CoreSchema.PartnerLinkUpdateInput,
) {
  return client.mutation({
    updatePartnerLink: { __args: { id, data }, id: true },
  });
}
