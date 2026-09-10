import type { CoreApiClient } from 'twenty-client-sdk/core';

export function findCompanyByName(client: CoreApiClient, name: string) {
  return client.query({
    companies: {
      __args: { filter: { name: { eq: name } }, first: 1 },
      edges: { node: { id: true } },
    },
  });
}
