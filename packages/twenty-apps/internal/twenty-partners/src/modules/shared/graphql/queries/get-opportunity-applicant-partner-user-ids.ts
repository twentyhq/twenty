import { type CoreApiClient } from 'twenty-client-sdk/core';

export function getOpportunityApplicantPartnerUserIds(
  client: CoreApiClient,
  opportunityId: string,
) {
  return client.query({
    opportunities: {
      __args: { filter: { id: { eq: opportunityId } }, first: 1 },
      edges: { node: { id: true, applicantPartnerUserIds: true } },
    },
  });
}
