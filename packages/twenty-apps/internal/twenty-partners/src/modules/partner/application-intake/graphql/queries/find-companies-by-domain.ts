import type { CoreApiClient } from 'twenty-client-sdk/core';

export function findCompaniesByDomain(
  client: CoreApiClient,
  host: string,
  cursor: string | null,
) {
  return client.query({
    companies: {
      __args: {
        filter: { domainName: { primaryLinkUrl: { ilike: `%${host}%` } } },
        first: 20,
        ...(cursor !== null ? { after: cursor } : {}),
      },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: { node: { id: true, domainName: { primaryLinkUrl: true } } },
    },
  });
}
