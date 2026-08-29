import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

export function updatePartnerContent(
  client: CoreApiClient,
  id: string,
  data: CoreSchema.PartnerContentUpdateInput,
) {
  return client.mutation({
    updatePartnerContent: { __args: { id, data }, id: true },
  });
}
