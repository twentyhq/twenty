import { getClient } from 'src/modules/shared/twenty-client';

export type PrNeedingQa = {
  id: string;
  name?: string | null;
  githubNumber?: number | null;
  url?: { primaryLinkLabel?: string | null; primaryLinkUrl?: string | null } | null;
  mergedAt?: string | null;
  testerId?: string | null;
  tester?: {
    id: string;
    name?: string | null;
    ghLogin?: string | null;
    discordId?: string | null;
  } | null;
};

export async function findPrsNeedingQa(): Promise<PrNeedingQa[]> {
  const client = getClient();
  const res = await client.query({
    pullRequests: {
      __args: {
        filter: {
          and: [
            { state: { eq: 'MERGED' } },
            { mustBeQa: { eq: true } },
            { hasQaBeenDoneOnMain: { eq: false } },
            { testerId: { is: 'NOT_NULL' } },
          ],
        },
        orderBy: { mergedAt: 'DescNullsLast' },
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
          githubNumber: true,
          url: { primaryLinkLabel: true, primaryLinkUrl: true },
          mergedAt: true,
          testerId: true,
          tester: { id: true, name: true, ghLogin: true, discordId: true },
        },
      },
    },
  });

  const edges = (res.pullRequests as { edges: { node: PrNeedingQa }[] })
    ?.edges;
  return edges?.map((e) => e.node) ?? [];
}
