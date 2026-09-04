import { type CoreApiClient } from 'twenty-client-sdk/core';

export function updateOpportunityApplicantPartnerUserIds(
  client: CoreApiClient,
  opportunityId: string,
  applicantPartnerUserIds: string[],
) {
  return client.mutation({
    updateOpportunity: {
      __args: { id: opportunityId, data: { applicantPartnerUserIds } },
      id: true,
    },
  });
}
