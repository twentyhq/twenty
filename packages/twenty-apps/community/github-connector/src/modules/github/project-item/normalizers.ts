import type { LinksFieldValue } from 'src/modules/shared/types';
import { toLinksField } from 'src/modules/shared/types';
import type { ProjectV2Item } from 'src/modules/github/project-item/types/project-v2-item';
import {
  extractFieldValue,
  extractAssigneeLogins,
} from 'src/modules/github/project-item/utils/extract-field-value';
import { findIssueByNumberAndRepo } from 'src/modules/github/issue/graphql/queries/find-by-number-and-repo';
import {
  findPullRequestByGithubNumber,
  findPullRequestByRepoAndNumber,
} from 'src/modules/github/pull-request/graphql/queries/find-by-github-number';
import { findContributorByGhLogin } from 'src/modules/github/contributor/graphql/queries/find-by-gh-login';

const STATUS_MAP: Record<string, string> = {
  'No Status': 'NO_STATUS',
  Backlog: 'BACKLOG',
  Todo: 'TODO',
  'In Progress': 'IN_PROGRESS',
  'In Review': 'IN_REVIEW',
  Done: 'DONE',
};

const PRIORITY_MAP: Record<string, string> = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
  Critical: 'CRITICAL',
};

export type ProjectItemUpsertInput = {
  name: string;
  githubProjectItemId: string;
  status: string;
  sprint: string;
  assignees: string;
  priority: string | null;
  mainAssigneeId: string | null;
  linkedIssueId: string | null;
  linkedPullRequestId: string | null;
  githubUrl: LinksFieldValue | null;
  repo: string;
};

export async function projectItemFromGraphql(
  item: ProjectV2Item,
): Promise<ProjectItemUpsertInput> {
  const title =
    item.content?.title ??
    (extractFieldValue(item, 'Title') || 'Untitled');
  const rawStatus = extractFieldValue(item, 'Status');
  const status = STATUS_MAP[rawStatus] ?? 'NO_STATUS';
  const sprint =
    extractFieldValue(item, 'Sprint') ||
    extractFieldValue(item, 'Iteration');
  const assigneeLogins = extractAssigneeLogins(item);
  const assignees = assigneeLogins.join(', ');
  const rawPriority = extractFieldValue(item, 'Priority');
  const priority = PRIORITY_MAP[rawPriority] ?? null;

  let mainAssigneeId: string | null = null;
  if (assigneeLogins.length > 0) {
    const contributor = await findContributorByGhLogin(assigneeLogins[0]);
    mainAssigneeId = contributor?.id ?? null;
  }

  let linkedIssueId: string | null = null;
  let linkedPullRequestId: string | null = null;
  let repo = '';
  let githubUrl: LinksFieldValue | null = null;

  if (item.content) {
    const contentType = item.content.__typename;
    repo = item.content.repository?.nameWithOwner ?? '';

    if (contentType === 'Issue' && item.content.number) {
      const issue = await findIssueByNumberAndRepo(item.content.number, repo);
      linkedIssueId = issue?.id ?? null;
      if (item.content.url) {
        githubUrl = toLinksField(item.content.url, `#${item.content.number}`);
      }
    } else if (contentType === 'PullRequest' && item.content.number) {
      const pr = repo
        ? await findPullRequestByRepoAndNumber(repo, item.content.number)
        : await findPullRequestByGithubNumber(item.content.number);
      linkedPullRequestId = pr?.id ?? null;
      if (item.content.url) {
        githubUrl = toLinksField(item.content.url, `#${item.content.number}`);
      }
    }
  }

  return {
    name: title,
    githubProjectItemId: item.id,
    status,
    sprint,
    assignees,
    priority,
    mainAssigneeId,
    linkedIssueId,
    linkedPullRequestId,
    githubUrl,
    repo,
  };
}
