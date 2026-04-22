import { chunkedBatchCreate } from 'src/modules/shared/twenty-client';
import type { LinksFieldValue } from 'src/modules/shared/types';
import type { PullRequestRow } from 'src/modules/github/pull-request/types/pull-request-row';

export async function batchUpsertPullRequests(
  items: Array<{
    githubNumber: number;
    uniqueIdentifier: string;
    name: string;
    url: LinksFieldValue;
    state: string;
    mergedAt: string | null;
    closedAt: string | null;
    githubCreatedAt: string | null;
    authorId: string | null;
    mergerId: string | null;
  }>,
): Promise<PullRequestRow[]> {
  return chunkedBatchCreate('createPullRequests', items, {
    id: true,
    githubNumber: true,
    uniqueIdentifier: true,
    name: true,
    state: true,
  }) as Promise<PullRequestRow[]>;
}
