import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

export function createPartner(
  client: CoreApiClient,
  data: CoreSchema.PartnerCreateInput,
) {
  return client.mutation({
    createPartner: {
      __args: { data },
      id: true,
    },
  });
}
