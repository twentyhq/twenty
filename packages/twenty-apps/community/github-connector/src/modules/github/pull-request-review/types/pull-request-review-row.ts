export type PullRequestReviewRow = {
  id: string;
  title?: string | null;
  reviewKey?: string | null;
  state?: string | null;
  firstSubmittedAt?: string | null;
  lastSubmittedAt?: string | null;
  eventCount?: number | null;
  reviewerId?: string | null;
  pullRequestId?: string | null;
};
