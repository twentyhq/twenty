import { type CoreApiClient } from 'twenty-client-sdk/core';

export function findPartnerContentRows(client: CoreApiClient, partnerId: string) {
  return client.query({
    partnerContents: {
      __args: { filter: { partnerId: { eq: partnerId } } },
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
  });
}
