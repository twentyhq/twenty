import { type CoreApiClient } from 'twenty-client-sdk/core';

import { sleepForMilliseconds } from 'src/utils/sleep-for-milliseconds.util';

import { FIREFLIES_BACKFILL_PAGE_SIZE } from 'src/logic-functions/constants/fireflies-backfill-page-size.constant';
import { HTTP_TOO_MANY_REQUESTS_STATUS_CODE } from 'src/logic-functions/constants/http-too-many-requests-status-code.constant';
import { findCallRecordingFieldStatesOrThrow } from 'src/logic-functions/data/find-call-recording-field-states-or-throw.util';
import { syncFirefliesTranscriptPage } from 'src/logic-functions/flows/sync-fireflies-transcript-page.util';
import { type FirefliesBackfillCursor } from 'src/logic-functions/types/fireflies-backfill-cursor.type';
import { type ImportMissingFirefliesCallsResult } from 'src/logic-functions/types/import-missing-fireflies-calls-result.type';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';
import { isRetryableFirefliesApiStatus } from 'src/logic-functions/utils/is-retryable-fireflies-api-status.util';
import { listFirefliesTranscripts } from 'src/logic-functions/utils/list-fireflies-transcripts.util';

type ImportMissingFirefliesCallsParams = {
  apiKey: string;
  coreApiClient: CoreApiClient;
  cursor: FirefliesBackfillCursor;
  sleep?: (milliseconds: number) => Promise<void>;
};

const EMPTY_CALL_COUNTS = {
  importedCallCount: 0,
  erroredCallCount: 0,
  skippedCallCount: 0,
};

export const importMissingFirefliesCalls = async ({
  apiKey,
  coreApiClient,
  cursor,
  sleep = sleepForMilliseconds,
}: ImportMissingFirefliesCallsParams): Promise<ImportMissingFirefliesCallsResult> => {
  const listFirefliesTranscriptsResult = await listFirefliesTranscripts({
    apiKey,
    fromDate: cursor.fromDate,
    toDate: cursor.toDate,
    limit: FIREFLIES_BACKFILL_PAGE_SIZE,
    skip: cursor.skip,
  });

  if (!listFirefliesTranscriptsResult.ok) {
    const isRateLimited =
      listFirefliesTranscriptsResult.status ===
      HTTP_TOO_MANY_REQUESTS_STATUS_CODE;

    if (
      isRateLimited ||
      isRetryableFirefliesApiStatus(listFirefliesTranscriptsResult.status)
    ) {
      return {
        stopReason: isRateLimited ? 'rate-limited' : 'retryable-error',
        ...EMPTY_CALL_COUNTS,
        continuationCursor: cursor,
      };
    }

    return {
      stopReason: 'list-failed',
      ...EMPTY_CALL_COUNTS,
      continuationCursor: cursor,
      listErrorMessage: listFirefliesTranscriptsResult.errorMessage,
    };
  }

  const firefliesCallSummaries = listFirefliesTranscriptsResult.data;

  if (firefliesCallSummaries.length === 0) {
    return {
      stopReason: 'exhausted',
      ...EMPTY_CALL_COUNTS,
    };
  }

  const callRecordingFieldStates = await findCallRecordingFieldStatesOrThrow({
    coreApiClient,
    callRecordingIds: firefliesCallSummaries.map((firefliesCallSummary) =>
      computeCallRecordingIdForFirefliesMeeting(firefliesCallSummary.id),
    ),
  });
  const pageSyncResult = await syncFirefliesTranscriptPage({
    apiKey,
    coreApiClient,
    firefliesCallSummaries,
    callRecordingFieldStates,
    pageCursor: cursor,
    sleep,
  });
  const pageCallCounts = {
    importedCallCount: pageSyncResult.importedCallCount,
    erroredCallCount: pageSyncResult.erroredCallCount,
    skippedCallCount: pageSyncResult.skippedCallCount,
  };

  if (
    pageSyncResult.status === 'rate-limited' ||
    pageSyncResult.status === 'retryable-error'
  ) {
    return {
      stopReason: pageSyncResult.status,
      ...pageCallCounts,
      continuationCursor: pageSyncResult.continuationCursor,
    };
  }

  if (firefliesCallSummaries.length < FIREFLIES_BACKFILL_PAGE_SIZE) {
    return {
      stopReason: 'exhausted',
      ...pageCallCounts,
    };
  }

  return {
    stopReason: 'page-complete',
    ...pageCallCounts,
    continuationCursor: {
      ...cursor,
      skip: cursor.skip + firefliesCallSummaries.length,
    },
  };
};
