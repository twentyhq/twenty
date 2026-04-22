export type PullRequestReviewEventRow = {
  id: string;
  title?: string | null;
  githubReviewId?: number | null;
  state?: string | null;
  submittedAt?: string | null;
  reviewerId?: string | null;
  pullRequestId?: string | null;
  reviewId?: string | null;
};
