import { type CoreApiClient } from 'twenty-client-sdk/core';

// CoreApiClient is codegenerated from the synced workspace schema, so the query
// selection is strictly typed. Keep the fetch in one place and derive the
// response shape from it, so the HTTP contract can never drift from what we
// actually ask the API for.
export const queryAvailablePartners = (client: CoreApiClient) =>
  client.query({
    partners: {
      __args: {
        filter: {
          validationStage: { eq: 'VALIDATED' },
          availability: { eq: 'AVAILABLE' },
          slug: { neq: '' },
        },
        orderBy: [{ name: 'AscNullsLast' }],
        first: 100,
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
