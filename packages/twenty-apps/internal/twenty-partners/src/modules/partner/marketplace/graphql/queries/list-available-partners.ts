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
          partnerTier: true,
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
          // The server ignores nested relation arguments and caps every
          // relation read at QUERY_MAX_RECORDS_FROM_RELATION (60), unordered.
          // A partner holding more than 60 contents would report a truncated
          // case-study count. Read these at the root and group by partner if
          // any partner ever approaches that.
          partnerServices: {
            edges: { node: { id: true } },
          },
          partnerContents: {
            edges: {
              node: {
                contentType: true,
                status: true,
                coverImage: { url: true },
                coverImageUrl: true,
              },
            },
          },
        },
      },
    },
  });
