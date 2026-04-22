import type { LinksFieldValue } from 'src/modules/shared/types';

export type ProjectItemRow = {
  id: string;
  name?: string | null;
  githubProjectItemId?: string | null;
  status?: string | null;
  sprint?: string | null;
  assignees?: string | null;
  priority?: string | null;
  mainAssigneeId?: string | null;
  linkedIssueId?: string | null;
  linkedPullRequestId?: string | null;
  githubUrl?: LinksFieldValue | null;
  repo?: string | null;
};
