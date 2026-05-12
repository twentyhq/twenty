import { getClient } from 'src/modules/shared/twenty-client';

export type ContributorSearchResult = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
};

export async function searchContributors(
  query: string,
  limit: number,
): Promise<ContributorSearchResult[]> {
  const client = getClient();

  const filter =
    query.length === 0
      ? undefined
      : {
          or: [
            { name: { ilike: `%${query}%` } },
            { ghLogin: { ilike: `%${query}%` } },
          ],
        };

  const res = await client.query({
    contributors: {
      __args: {
        ...(filter ? { filter } : {}),
        orderBy: [{ name: 'AscNullsLast' }],
        first: limit,
      },
      edges: {
        node: {
          id: true,
          name: true,
          ghLogin: true,
          avatarUrl: { primaryLinkUrl: true },
        },
      },
    },
  });

  const edges = res.contributors?.edges ?? [];

  return edges.map((e) => ({
    id: e.node.id,
    name: e.node.name ?? null,
    ghLogin: e.node.ghLogin ?? null,
    avatarUrl: e.node.avatarUrl?.primaryLinkUrl ?? null,
  }));
}
