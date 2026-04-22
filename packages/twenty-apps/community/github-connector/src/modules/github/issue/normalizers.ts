import type { LinksFieldValue } from 'src/modules/shared/types';
import { toLinksField } from 'src/modules/shared/types';
import type { GitHubIssue } from 'src/modules/github/issue/types/github-issue';
import type { GqlIssue } from 'src/modules/github/issue/graphql/github/fetch-issues';

export type IssueState = 'OPEN' | 'CLOSED';

export type IssueCanonical = {
  title: string;
  githubNumber: number;
  uniqueIdentifier: string;
  githubUrl: LinksFieldValue;
  state: IssueState;
  labels: string[];
  githubCreatedAt: string | null;
  closedAt: string | null;
  repo: string;
};

export function deriveIssueState(state: string): IssueState {
  return state.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN';
}

export function buildIssueUniqueIdentifier(
  repoFullName: string,
  number: number,
): string {
  return `${repoFullName}#${number}`;
}

export function issueFromWebhook(
  issue: GitHubIssue,
  repoFullName: string,
): IssueCanonical {
  return {
    title: issue.title,
    githubNumber: issue.number,
    uniqueIdentifier: buildIssueUniqueIdentifier(repoFullName, issue.number),
    githubUrl: toLinksField(issue.html_url, issue.title),
    state: deriveIssueState(issue.state),
    labels: issue.labels.map((l) => l.name),
    githubCreatedAt: issue.created_at,
    closedAt: issue.closed_at,
    repo: repoFullName,
  };
}

export function issueFromGraphql(
  issue: GqlIssue,
  repoFullName: string,
): IssueCanonical {
  return {
    title: issue.title,
    githubNumber: issue.number,
    uniqueIdentifier: buildIssueUniqueIdentifier(repoFullName, issue.number),
    githubUrl: toLinksField(issue.url, issue.title),
    state: deriveIssueState(issue.state),
    labels: issue.labels.nodes.map((l) => l.name),
    githubCreatedAt: issue.createdAt,
    closedAt: issue.closedAt,
    repo: repoFullName,
  };
}
