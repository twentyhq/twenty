import { type CoreApiClient } from 'twenty-client-sdk/core';

type CompaniesConnection = { edges?: { node: { id: string } }[] };

export const findCompanyIdByFilter = async ({
  client,
  filter,
  requireUnique = false,
}: {
  client: CoreApiClient;
  filter: Record<string, unknown>;
  requireUnique?: boolean;
}): Promise<string | undefined> => {
  const result = (await client.query({
    companies: {
      __args: { filter, first: requireUnique ? 2 : 1 },
      edges: { node: { id: true } },
    },
  })) as { companies?: CompaniesConnection };

  const edges = result.companies?.edges ?? [];

  if (requireUnique && edges.length !== 1) {
    return undefined;
  }

  return edges[0]?.node?.id;
};
