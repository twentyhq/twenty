import {
  consolidateReviews,
  type ReviewEventForConsolidation,
} from 'src/modules/github/pull-request-review/utils/consolidate-reviews';

export type ConsolidatedReviewUpsertInput = {
  reviewKey: string;
  title: string;
  state: string;
  firstSubmittedAt: string | null;
  lastSubmittedAt: string | null;
  eventCount: number;
  reviewerId: string | null;
  pullRequestId: string;
  isSelfReview: boolean;
};

export type BuildConsolidatedRowParams = {
  pullRequestId: string;
  reviewerId: string | null;
  prNumber: number | null;
  reviewerLogin: string | null;
  events: ReviewEventForConsolidation[];
  /**
   * Author of the PR being reviewed. When non-null and equal to `reviewerId`
   * the consolidated row is flagged as a self-review so downstream
   * aggregations (top reviewers, contributor stats, etc.) can exclude it.
   */
  prAuthorId?: string | null;
};

export const isSelfReview = (
  reviewerId: string | null,
  prAuthorId: string | null | undefined,
): boolean =>
  reviewerId !== null &&
  prAuthorId !== null &&
  prAuthorId !== undefined &&
  reviewerId === prAuthorId;

export const buildReviewKey = (
  pullRequestId: string,
  reviewerId: string | null,
): string => `${pullRequestId}:${reviewerId ?? 'unknown'}`;

export const buildConsolidatedTitle = (
  reviewerLogin: string | null,
  prNumber: number | null,
): string => {
  const login = reviewerLogin ?? 'unknown';
  const number = typeof prNumber === 'number' ? prNumber : '?';
  return `${login} on PR #${number}`;
};

export const buildConsolidatedRow = (
  params: BuildConsolidatedRowParams,
): ConsolidatedReviewUpsertInput => {
  const verdict = consolidateReviews(params.events);
  return {
    reviewKey: buildReviewKey(params.pullRequestId, params.reviewerId),
    title: buildConsolidatedTitle(params.reviewerLogin, params.prNumber),
    state: verdict.state,
    firstSubmittedAt: verdict.firstSubmittedAt,
    lastSubmittedAt: verdict.lastSubmittedAt,
    eventCount: verdict.eventCount,
    reviewerId: params.reviewerId,
    pullRequestId: params.pullRequestId,
    isSelfReview: isSelfReview(params.reviewerId, params.prAuthorId ?? null),
  };
};
