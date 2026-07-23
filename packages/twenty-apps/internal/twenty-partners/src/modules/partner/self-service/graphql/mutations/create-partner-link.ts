import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

export function createPartnerLink(
  client: CoreApiClient,
  data: CoreSchema.PartnerLinkCreateInput,
) {
  return client.mutation({
    createPartnerLink: { __args: { data }, id: true },
  });
}
