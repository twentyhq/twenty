import type { ContributorRow } from 'src/modules/github/contributor/types/contributor-row';
import { getClient } from 'src/modules/shared/twenty-client';

export async function findContributorByGhLogin(
  ghLogin: string,
): Promise<ContributorRow | null> {
  const client = getClient();
  const res = await client.query({
    contributors: {
      __args: {
        filter: { ghLogin: { eq: ghLogin } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          ghLogin: true,
          name: true,
          githubId: true,
        },
      },
    },
  });

  const edges = res.contributors?.edges;
  return (edges?.[0]?.node as ContributorRow | undefined) ?? null;
}
