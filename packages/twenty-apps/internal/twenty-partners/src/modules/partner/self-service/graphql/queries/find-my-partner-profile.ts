import { type CoreApiClient } from 'twenty-client-sdk/core';

// CoreApiClient is codegenerated from the synced workspace schema, so the
// selection is strictly typed and the response shape derives from it.
export function findMyPartnerProfile(client: CoreApiClient, partnerId: string) {
  return client.query({
    partners: {
      __args: {
        filter: { id: { eq: partnerId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          name: true,
          introduction: true,
          city: true,
          country: true,
          languagesSpoken: true,
          partnerScope: true,
          skills: true,
          typeOfTeam: true,
          availability: true,
          hourlyRate: { amountMicros: true, currencyCode: true },
          projectBudgetMin: { amountMicros: true, currencyCode: true },
          website: { primaryLinkUrl: true },
          linkedin: { primaryLinkUrl: true },
          calendarLink: { primaryLinkUrl: true },
          profilePicture: { primaryLinkUrl: true },
          profilePictureFile: { url: true },
          region: true,
          deploymentExpertise: true,
          partnerLinks: {
            edges: {
              node: {
                id: true,
                name: true,
                url: { primaryLinkUrl: true },
                sortOrder: true,
              },
            },
          },
          partnerServices: {
            edges: {
              node: {
                id: true,
                title: true,
                description: true,
                sortOrder: true,
              },
            },
          },
          partnerContents: {
            edges: {
              node: {
                id: true,
                name: true,
                clientName: true,
                headline: true,
                body: { markdown: true },
                coverImageUrl: true,
                caseStudyLink: { primaryLinkUrl: true },
                status: true,
                contentType: true,
              },
            },
          },
        },
      },
    },
  });
}
