import type { GitHubReview } from 'src/modules/github/pull-request-review-event/types/github-review';

export type ReviewEventState =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'COMMENTED'
  | 'DISMISSED';

export type ReviewEventCanonical = {
  githubReviewId: number;
  title: string;
  state: ReviewEventState;
  submittedAt: string | null;
};

export type GqlReviewLike = {
  databaseId: number;
  state: ReviewEventState;
  submittedAt: string | null;
  author: { login: string } | null;
};

export function buildReviewEventTitle(login: string, state: string): string {
  return `${login} \u2014 ${state.toLowerCase()}`;
}

export function reviewEventFromWebhook(
  review: GitHubReview,
): ReviewEventCanonical {
  return {
    githubReviewId: review.id,
    title: buildReviewEventTitle(review.user.login, review.state),
    state: review.state,
    submittedAt: review.submitted_at,
  };
}

export function reviewEventFromGraphql(
  review: GqlReviewLike,
): ReviewEventCanonical {
  const login = review.author?.login ?? 'unknown';
  return {
    githubReviewId: review.databaseId,
    title: buildReviewEventTitle(login, review.state),
    state: review.state,
    submittedAt: review.submittedAt,
  };
}
