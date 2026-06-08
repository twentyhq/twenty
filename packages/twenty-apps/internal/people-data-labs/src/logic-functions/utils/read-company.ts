import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CompanyNode } from 'src/types/company-node';

export const readCompany = async (
  client: CoreApiClient,
  recordId: string,
): Promise<CompanyNode | undefined> => {
  const result = (await client.query({
    companies: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          domainName: { primaryLinkUrl: true },
          linkedinLink: { primaryLinkUrl: true },
          address: {
            addressStreet1: true,
            addressStreet2: true,
            addressCity: true,
            addressPostcode: true,
            addressState: true,
            addressCountry: true,
          },
          pdlId: true,
          pdlLastEnrichedAt: true,
        },
      },
    },
  })) as { companies?: { edges?: { node: CompanyNode }[] } };

  return result.companies?.edges?.[0]?.node;
};
