import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

export function updatePartnerPreReviewVerdict(
  client: CoreApiClient,
  id: string,
  preReviewVerdict: CoreSchema.PartnerUpdateInput['preReviewVerdict'],
) {
  return client.mutation({
    updatePartner: {
      __args: { id, data: { preReviewVerdict } },
      id: true,
    },
  });
}
