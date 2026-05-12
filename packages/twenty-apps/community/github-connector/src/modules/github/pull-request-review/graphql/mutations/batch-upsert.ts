import { chunkedBatchCreate } from 'src/modules/shared/twenty-client';
import type { PullRequestReviewRow } from 'src/modules/github/pull-request-review/types/pull-request-review-row';
import type { ConsolidatedReviewUpsertInput } from 'src/modules/github/pull-request-review/utils/build-consolidated-row';

export async function batchUpsertConsolidatedReviews(
  items: ConsolidatedReviewUpsertInput[],
): Promise<PullRequestReviewRow[]> {
  return chunkedBatchCreate('createPullRequestReviews', items, {
    id: true,
    reviewKey: true,
    title: true,
    state: true,
    firstSubmittedAt: true,
    lastSubmittedAt: true,
    eventCount: true,
    reviewerId: true,
    pullRequestId: true,
    isSelfReview: true,
  }) as Promise<PullRequestReviewRow[]>;
}
