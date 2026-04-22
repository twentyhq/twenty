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

/**
 * Looks up a pull request by `(repo, githubNumber)`. Repo is matched against
 * `uniqueIdentifier` (which we set to `owner/repo#number`) so we don't link a
 * PR to the wrong row when several configured repos share the same PR number.
 */
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

  const edges = (res.pullRequests as { edges: { node: PullRequestRow }[] })
    ?.edges;
  return edges?.[0]?.node ?? null;
}

/**
 * Looks up a pull request by `githubNumber` only. Ambiguous when multiple
 * configured repos contain a PR with the same number — prefer
 * `findPullRequestByRepoAndNumber` whenever the repo is known.
 */
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

  const edges = (res.pullRequests as { edges: { node: PullRequestRow }[] })
    ?.edges;
  return edges?.[0]?.node ?? null;
}
