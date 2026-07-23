import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

export function updatePartnerService(
  client: CoreApiClient,
  id: string,
  data: CoreSchema.PartnerServiceUpdateInput,
) {
  return client.mutation({
    updatePartnerService: { __args: { id, data }, id: true },
  });
}
