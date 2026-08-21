import type { FIREFLIES_BACKFILL_OUTCOME } from 'src/constants/fireflies-backfill-outcome.constant';

export type FirefliesBackfillResult =
  | {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED;
      error: string;
    }
  | {
      outcome: typeof FIREFLIES_BACKFILL_OUTCOME.COMPLETED;
      fromDate: string;
      toDate: string;
      transcriptCount: number;
      batchCount: number;
      enqueuedBatchCount: number;
    };
