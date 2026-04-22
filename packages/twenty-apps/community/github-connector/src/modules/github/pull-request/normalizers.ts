import type { LinksFieldValue } from 'src/modules/shared/types';
import { toLinksField } from 'src/modules/shared/types';
function mustBeQa(title: string): boolean {
  const lower = title.toLowerCase().trim();
  if (lower.includes('[no-qa]') || lower.includes('[noqa]')) return false;
  return true;
}
import type { GitHubPullRequest } from 'src/modules/github/connector/types';
import type { GqlPullRequest } from 'src/modules/github/connector/graphql';

export type PullRequestState = 'OPEN' | 'CLOSED' | 'MERGED';

export type PullRequestCanonical = {
  githubNumber: number;
  uniqueIdentifier: string;
  name: string;
  url: LinksFieldValue;
  state: PullRequestState;
  mergedAt: string | null;
  closedAt: string | null;
  githubCreatedAt: string | null;
  mustBeQa: boolean;
};

export function derivePrState(
  merged: boolean | null | undefined,
  state: string,
): PullRequestState {
  if (merged) return 'MERGED';
  return state.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN';
}

export function buildPrUniqueIdentifier(
  repoFullName: string,
  number: number,
): string {
  return `${repoFullName}#${number}`;
}

export function pullRequestFromWebhook(
  pr: GitHubPullRequest,
  repoFullName: string,
): PullRequestCanonical {
  return {
    githubNumber: pr.number,
    uniqueIdentifier: buildPrUniqueIdentifier(repoFullName, pr.number),
    name: pr.title,
    url: toLinksField(pr.html_url, pr.title),
    state: derivePrState(pr.merged, pr.state),
    mergedAt: pr.merged_at,
    closedAt: pr.closed_at,
    githubCreatedAt: pr.created_at,
    mustBeQa: mustBeQa(pr.title),
  };
}

export function pullRequestFromGraphql(
  pr: GqlPullRequest,
  repoFullName: string,
): PullRequestCanonical {
  return {
    githubNumber: pr.number,
    uniqueIdentifier: buildPrUniqueIdentifier(repoFullName, pr.number),
    name: pr.title,
    url: toLinksField(pr.url, pr.title),
    state: derivePrState(pr.merged, pr.state),
    mergedAt: pr.mergedAt,
    closedAt: pr.closedAt,
    githubCreatedAt: pr.createdAt,
    mustBeQa: mustBeQa(pr.title),
  };
}
