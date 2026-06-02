import type { GitHubUser } from 'src/modules/github/connector/github-user';

export type GitHubPullRequest = {
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  merged: boolean | null;
  merged_at: string | null;
  closed_at: string | null;
  created_at: string;
  user: GitHubUser;
  merged_by: GitHubUser | null;
};
