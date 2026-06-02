import { chunkedBatchCreate } from 'src/modules/shared/twenty-client';
import type { PullRequestReviewEventRow } from 'src/modules/github/pull-request-review-event/types/pull-request-review-event-row';

export async function batchUpsertReviewEvents(
  items: Array<{
    githubReviewId: number;
    title: string;
    state: string;
    submittedAt: string | null;
    reviewerId: string | null;
    pullRequestId: string;
    reviewId?: string | null;
  }>,
): Promise<PullRequestReviewEventRow[]> {
  return chunkedBatchCreate('createPullRequestReviewEvents', items, {
    id: true,
    githubReviewId: true,
    title: true,
    state: true,
    submittedAt: true,
    reviewerId: true,
    pullRequestId: true,
    reviewId: true,
  }) as Promise<PullRequestReviewEventRow[]>;
}
