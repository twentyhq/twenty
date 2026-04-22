import { getClient } from 'src/modules/shared/twenty-client';
import type { PullRequestRow } from 'src/modules/github/pull-request/types/pull-request-row';
import { buildPrUniqueIdentifier } from 'src/modules/github/pull-request/normalizers';

const PR_NODE_SELECTION = {
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
} as const;

export async function findPullRequestByRepoAndNumber(
  repo: string,
  githubNumber: number,
): Promise<PullRequestRow | null> {
  const client = getClient();
  const uniqueIdentifier = buildPrUniqueIdentifier(repo, githubNumber);
  const res = await client.query({
    pullRequests: {
      __args: {
        filter: { uniqueIdentifier: { eq: uniqueIdentifier } },
        first: 1,
      },
      edges: { node: PR_NODE_SELECTION },
    },
  });

  const node = res.pullRequests?.edges?.[0]?.node;
  return (node as PullRequestRow | undefined) ?? null;
}

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
      edges: { node: PR_NODE_SELECTION },
    },
  });

  const node = res.pullRequests?.edges?.[0]?.node;
  return (node as PullRequestRow | undefined) ?? null;
}
