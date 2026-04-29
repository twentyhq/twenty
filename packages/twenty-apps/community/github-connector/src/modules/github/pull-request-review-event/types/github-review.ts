import type { GitHubUser } from 'src/modules/github/connector/github-user';

export type GitHubReview = {
  id: number;
  user: GitHubUser;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
  submitted_at: string;
  body: string | null;
};
