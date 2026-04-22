import { getClient } from 'src/modules/shared/twenty-client';
import type { PullRequestRow } from 'src/modules/github/pull-request/types/pull-request-row';

export async function findPullRequestByGithubNumber(
  githubNumber: number,
): Promise<PullRequestRow | null> {
  const client = getClient();
  const res = await client.query({
    pullRequests: {
      __args: {
        filter: { githubNumber: { eq: githubNumber } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          name: true,
          githubNumber: true,
          uniqueIdentifier: true,
          url: { primaryLinkLabel: true, primaryLinkUrl: true },
          state: true,
          mergedAt: true,
          closedAt: true,
          githubCreatedAt: true,
          authorId: true,
          mergerId: true,
        },
      },
    },
  });

  const edges = (res.pullRequests as { edges: { node: PullRequestRow }[] })
    ?.edges;
  return edges?.[0]?.node ?? null;
}
