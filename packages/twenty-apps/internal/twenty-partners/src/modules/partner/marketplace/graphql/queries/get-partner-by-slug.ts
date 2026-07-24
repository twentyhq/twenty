import { type CoreApiClient } from 'twenty-client-sdk/core';

// CoreApiClient is codegenerated from the synced workspace schema, so the
// selection is strictly typed and the response shape derives from it.
export const queryPartnerBySlug = (client: CoreApiClient, slug: string) =>
  client.query({
    partners: {
      __args: {
        filter: {
          slug: { eq: slug },
          validationStage: { eq: 'VALIDATED' },
          availability: { eq: 'AVAILABLE' },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          name: true,
          slug: true,
          introduction: true,
          languagesSpoken: true,
          deploymentExpertise: true,
          partnerScope: true,
          region: true,
          calendarLink: { primaryLinkUrl: true },
          hourlyRate: { amountMicros: true, currencyCode: true },
          projectBudgetMin: { amountMicros: true, currencyCode: true },
          linkedin: { primaryLinkUrl: true },
          website: { primaryLinkUrl: true },
          partnerLinks: {
            edges: {
              node: {
                url: { primaryLinkUrl: true },
                sortOrder: true,
                position: true,
              },
            },
          },
          partnerServices: {
            edges: {
              node: {
                title: true,
                description: true,
                sortOrder: true,
                position: true,
              },
            },
          },
          partnerContents: {
            edges: {
              node: {
                contentType: true,
                status: true,
                clientName: true,
                headline: true,
                body: { markdown: true },
                coverImage: { url: true },
                coverImageUrl: true,
                caseStudyLink: { primaryLinkUrl: true },
                position: true,
              },
            },
          },
          // profilePicture is the legacy LINKS url; profilePictureFile is the
          // new FILES upload (its items expose `url`). Display prefers the file.
          profilePicture: { primaryLinkUrl: true },
          profilePictureFile: { url: true },
          skills: true,
          city: true,
          country: true,
        },
      },
    },
  });
