import type { GitHubUser } from 'src/modules/github/connector/github-user';
import type { GitHubPullRequest } from 'src/modules/github/pull-request/types/github-pull-request';
import type { GitHubReview } from 'src/modules/github/pull-request-review-event/types/github-review';
import type { GitHubIssue } from 'src/modules/github/issue/types/github-issue';
import type { GitHubProjectV2Item } from 'src/modules/github/project-item/types/github-project-v2-item';

export type GitHubWebhookPayload = {
  action: string;
  pull_request?: GitHubPullRequest;
  review?: GitHubReview;
  issue?: GitHubIssue;
  projects_v2_item?: GitHubProjectV2Item;
  sender: GitHubUser;
  repository?: { full_name: string };
};
