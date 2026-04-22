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
};

export type BuildConsolidatedRowParams = {
  pullRequestId: string;
  reviewerId: string | null;
  prNumber: number | null;
  reviewerLogin: string | null;
  events: ReviewEventForConsolidation[];
};

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
  };
};
