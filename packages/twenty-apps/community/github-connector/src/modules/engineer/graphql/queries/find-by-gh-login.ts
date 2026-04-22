import type { EngineerRow } from 'src/modules/engineer/types/engineer-row';
import { getClient } from 'src/modules/shared/twenty-client';

export async function findEngineerByGhLogin(
  ghLogin: string,
): Promise<EngineerRow | null> {
  const client = getClient();
  const res = await client.query({
    engineers: {
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

  const edges = (res.engineers as { edges: { node: EngineerRow }[] })?.edges;
  return edges?.[0]?.node ?? null;
}
