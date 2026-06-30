import { isNonEmptyString, isObject } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CompanyNode } from 'src/types/company-node';

export const readCompanies = async ({
  client,
  recordIds,
}: {
  client: CoreApiClient;
  recordIds: string[];
}): Promise<CompanyNode[]> => {
  if (recordIds.length === 0) {
    return [];
  }

  const result = (await client.query({
    companies: {
      __args: { filter: { id: { in: recordIds } }, first: recordIds.length },
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

  const edges = result.companies?.edges;
  if (!Array.isArray(edges)) {
    return [];
  }

  return edges
    .map((edge) => edge?.node)
    .filter(
      (companyNode): companyNode is CompanyNode =>
        isObject(companyNode) &&
        isNonEmptyString((companyNode as { id?: unknown }).id),
    );
};
