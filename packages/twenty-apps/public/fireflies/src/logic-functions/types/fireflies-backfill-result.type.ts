import type { FIREFLIES_BACKFILL_OUTCOME } from 'src/logic-functions/constants/fireflies-backfill-outcome.constant';
import { type ImportMissingFirefliesCallsResult } from 'src/logic-functions/types/import-missing-fireflies-calls-result.type';

type CompletedFirefliesBackfillRunResult = Omit<
  Extract<ImportMissingFirefliesCallsResult, { stopReason: 'exhausted' }>,
  'stopReason'
>;

type ContinuableFirefliesBackfillRunResult = Omit<
  Extract<
    ImportMissingFirefliesCallsResult,
    { stopReason: 'page-complete' | 'retryable-error' }
  >,
  'stopReason'
>;

type RateLimitedFirefliesBackfillRunResult = Omit<
  Extract<ImportMissingFirefliesCallsResult, { stopReason: 'rate-limited' }>,
  'stopReason'
>;

type FailedFirefliesBackfillRunResult = Omit<
  Extract<ImportMissingFirefliesCallsResult, { stopReason: 'list-failed' }>,
  'stopReason'
>;

export type FirefliesBackfillResult =
  | {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.INVALID_REQUEST;
      error: string;
    }
  | {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED;
      error: string;
    }
  | (CompletedFirefliesBackfillRunResult & {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.COMPLETED;
      fromDate: string;
      isContinuationEnqueued: false;
    })
  | (ContinuableFirefliesBackfillRunResult & {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.CONTINUATION_ENQUEUED;
      fromDate: string;
      isContinuationEnqueued: true;
    })
  | (ContinuableFirefliesBackfillRunResult & {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.CONTINUATION_ENQUEUE_FAILED;
      fromDate: string;
      isContinuationEnqueued: false;
    })
  | (RateLimitedFirefliesBackfillRunResult & {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.RATE_LIMITED;
      fromDate: string;
      isContinuationEnqueued: boolean;
    })
  | (FailedFirefliesBackfillRunResult & {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.LIST_FAILED;
      fromDate: string;
      isContinuationEnqueued: false;
    });
