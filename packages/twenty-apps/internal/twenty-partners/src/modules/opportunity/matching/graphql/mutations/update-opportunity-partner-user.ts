import type { CoreApiClient } from 'twenty-client-sdk/core';

export function updateOpportunityPartnerUser(
  client: CoreApiClient,
  opportunityId: string,
  partnerUserId: string | null,
) {
  return client.mutation({
    updateOpportunity: { __args: { id: opportunityId, data: { partnerUserId } }, id: true },
  });
}
