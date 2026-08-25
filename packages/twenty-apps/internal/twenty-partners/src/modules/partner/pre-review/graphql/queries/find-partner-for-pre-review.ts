import type { CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerForPreReview(client: CoreApiClient, id: string) {
  return client.query({
    partner: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      name: true,
      city: true,
      country: true,
      typeOfTeam: true,
      partnerScope: true,
      skills: true,
      twentyExperience: true,
      twentyExperienceNotes: true,
      applicationNotes: true,
      preReviewVerdict: true,
      hourlyRate: { amountMicros: true },
      projectBudgetMin: { amountMicros: true },
      website: { primaryLinkUrl: true },
      linkedin: { primaryLinkUrl: true },
      twentyExperienceProofLink: { primaryLinkUrl: true },
    },
  });
}
