import { chunkedBatchCreate } from 'src/modules/shared/twenty-client';
import type { ProjectItemRow } from 'src/modules/github/project-item/types/project-item-row';

export async function batchUpsertProjectItems(
  items: Array<{
    name: string;
    githubProjectItemId: string;
    status: string;
    sprint: string;
    assignees: string;
    priority: string | null;
    mainAssigneeId: string | null;
    linkedIssueId: string | null;
    linkedPullRequestId: string | null;
    githubUrl: { primaryLinkLabel: string; primaryLinkUrl: string; secondaryLinks: null } | null;
    repo: string;
  }>,
): Promise<ProjectItemRow[]> {
  return chunkedBatchCreate('createProjectItems', items, {
    id: true,
    githubProjectItemId: true,
    name: true,
    status: true,
    mainAssigneeId: true,
    linkedIssueId: true,
    linkedPullRequestId: true,
    githubUrl: { primaryLinkLabel: true, primaryLinkUrl: true },
  }) as Promise<ProjectItemRow[]>;
}
