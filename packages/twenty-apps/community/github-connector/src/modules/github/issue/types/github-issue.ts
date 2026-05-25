import type { GitHubUser } from 'src/modules/github/connector/github-user';

export type GitHubIssue = {
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  labels: Array<{ name: string }>;
  created_at: string;
  closed_at: string | null;
  user: GitHubUser;
  pull_request?: unknown;
};
