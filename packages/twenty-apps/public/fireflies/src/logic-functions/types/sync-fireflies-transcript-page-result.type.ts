import { type FirefliesBackfillCursor } from 'src/logic-functions/types/fireflies-backfill-cursor.type';

type FirefliesTranscriptPageCounts = {
  importedCallCount: number;
  erroredCallCount: number;
  skippedCallCount: number;
};

export type SyncFirefliesTranscriptPageResult =
  | (FirefliesTranscriptPageCounts & {
      status: 'completed';
    })
  | (FirefliesTranscriptPageCounts & {
      status: 'rate-limited';
      continuationCursor: FirefliesBackfillCursor;
    })
  | (FirefliesTranscriptPageCounts & {
      status: 'retryable-error';
      continuationCursor: FirefliesBackfillCursor;
    })
  | (FirefliesTranscriptPageCounts & {
      status: 'deadline';
      continuationCursor: FirefliesBackfillCursor;
    });
