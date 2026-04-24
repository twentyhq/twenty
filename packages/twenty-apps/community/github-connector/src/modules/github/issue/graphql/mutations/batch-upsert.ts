import { chunkedBatchCreate } from 'src/modules/shared/twenty-client';
import type { LinksFieldValue } from 'src/modules/shared/types';
import type { IssueRow } from 'src/modules/github/issue/types/issue-row';

export async function batchUpsertIssues(
  items: Array<{
    title: string;
    githubNumber: number;
    uniqueIdentifier: string;
    githubUrl: LinksFieldValue;
    state: string;
    labels: string[];
    githubCreatedAt: string | null;
    closedAt: string | null;
    repo: string;
    authorId: string | null;
  }>,
): Promise<IssueRow[]> {
  return chunkedBatchCreate('createIssues', items, {
    id: true,
    githubNumber: true,
    uniqueIdentifier: true,
    title: true,
    state: true,
    repo: true,
  }) as Promise<IssueRow[]>;
}
