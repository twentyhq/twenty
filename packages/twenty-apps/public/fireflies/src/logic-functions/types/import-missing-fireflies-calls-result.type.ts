import { type FirefliesBackfillCursor } from 'src/logic-functions/types/fireflies-backfill-cursor.type';

type ImportMissingFirefliesCallsCounts = {
  importedCallCount: number;
  erroredCallCount: number;
  skippedCallCount: number;
};

export type ImportMissingFirefliesCallsResult =
  | (ImportMissingFirefliesCallsCounts & {
      stopReason: 'exhausted';
    })
  | (ImportMissingFirefliesCallsCounts & {
      stopReason: 'page-complete';
      continuationCursor: FirefliesBackfillCursor;
    })
  | (ImportMissingFirefliesCallsCounts & {
      stopReason: 'rate-limited';
      continuationCursor: FirefliesBackfillCursor;
    })
  | (ImportMissingFirefliesCallsCounts & {
      stopReason: 'retryable-error';
      continuationCursor: FirefliesBackfillCursor;
    })
  | (ImportMissingFirefliesCallsCounts & {
      stopReason: 'list-failed';
      continuationCursor: FirefliesBackfillCursor;
      listErrorMessage: string;
    });
