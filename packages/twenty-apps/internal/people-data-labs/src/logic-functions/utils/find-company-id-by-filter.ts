import { type CoreApiClient } from 'twenty-client-sdk/core';

type CompaniesConnection = { edges?: { node: { id: string } }[] };

export const findCompanyIdByFilter = async ({
  client,
  filter,
}: {
  client: CoreApiClient;
  filter: Record<string, unknown>;
}): Promise<string | undefined> => {
  const result = (await client.query({
    companies: {
      __args: { filter, first: 1 },
      edges: { node: { id: true } },
    },
  })) as { companies?: CompaniesConnection };

  return result.companies?.edges?.[0]?.node?.id;
};
