import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

export function createPartnerContent(
  client: CoreApiClient,
  data: CoreSchema.PartnerContentCreateInput,
) {
  return client.mutation({
    createPartnerContent: { __args: { data }, id: true },
  });
}
