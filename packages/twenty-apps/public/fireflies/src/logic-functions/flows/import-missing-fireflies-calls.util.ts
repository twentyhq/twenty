import { type CoreApiClient } from 'twenty-client-sdk/core';

import { sleepForMilliseconds } from 'src/utils/sleep-for-milliseconds.util';

import { FIREFLIES_BACKFILL_PAGE_SIZE } from 'src/logic-functions/constants/fireflies-backfill-page-size.constant';
import { FIREFLIES_BACKFILL_RATE_LIMIT_PAUSE_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-rate-limit-pause-milliseconds.constant';
import { HTTP_TOO_MANY_REQUESTS_STATUS_CODE } from 'src/logic-functions/constants/http-too-many-requests-status-code.constant';
import { findCallRecordingFieldStatesOrThrow } from 'src/logic-functions/data/find-call-recording-field-states-or-throw.util';
import { syncFirefliesTranscriptPage } from 'src/logic-functions/flows/sync-fireflies-transcript-page.util';
import { type FirefliesBackfillCursor } from 'src/logic-functions/types/fireflies-backfill-cursor.type';
import { type ImportMissingFirefliesCallsResult } from 'src/logic-functions/types/import-missing-fireflies-calls-result.type';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';
import { isRetryableFirefliesApiStatus } from 'src/logic-functions/utils/is-retryable-fireflies-api-status.util';
import { listFirefliesTranscripts } from 'src/logic-functions/utils/list-fireflies-transcripts.util';

type FirefliesBackfillProgress = {
  pageCount: number;
  importedCallCount: number;
  erroredCallCount: number;
  skippedCallCount: number;
};

type ImportMissingFirefliesCallsParams = {
  apiKey: string;
  coreApiClient: CoreApiClient;
  cursor: FirefliesBackfillCursor;
  deadlineAtMilliseconds: number;
  getNowMilliseconds?: () => number;
  sleep?: (milliseconds: number) => Promise<void>;
};

type ImportNextFirefliesTranscriptPageParams = {
  apiKey: string;
  coreApiClient: CoreApiClient;
  cursor: FirefliesBackfillCursor;
  deadlineAtMilliseconds: number;
  firefliesBackfillProgress: FirefliesBackfillProgress;
  getNowMilliseconds: () => number;
  sleep: (milliseconds: number) => Promise<void>;
  slowestPageDurationMilliseconds: number;
};

const addPageToFirefliesBackfillProgress = ({
  firefliesBackfillProgress,
  pageResult,
}: {
  firefliesBackfillProgress: FirefliesBackfillProgress;
  pageResult: {
    importedCallCount: number;
    erroredCallCount: number;
    skippedCallCount: number;
  };
}): FirefliesBackfillProgress => ({
  pageCount: firefliesBackfillProgress.pageCount + 1,
  importedCallCount:
    firefliesBackfillProgress.importedCallCount + pageResult.importedCallCount,
  erroredCallCount:
    firefliesBackfillProgress.erroredCallCount + pageResult.erroredCallCount,
  skippedCallCount:
    firefliesBackfillProgress.skippedCallCount + pageResult.skippedCallCount,
});

const pauseBeforeFirefliesBackfillContinuation = async ({
  deadlineAtMilliseconds,
  getNowMilliseconds,
  sleep,
}: {
  deadlineAtMilliseconds: number;
  getNowMilliseconds: () => number;
  sleep: (milliseconds: number) => Promise<void>;
}): Promise<void> => {
  const pauseDurationMilliseconds = Math.min(
    FIREFLIES_BACKFILL_RATE_LIMIT_PAUSE_MILLISECONDS,
    Math.max(0, deadlineAtMilliseconds - getNowMilliseconds()),
  );

  if (pauseDurationMilliseconds > 0) {
    await sleep(pauseDurationMilliseconds);
  }
};

const importNextFirefliesTranscriptPage = async ({
  apiKey,
  coreApiClient,
  cursor,
  deadlineAtMilliseconds,
  firefliesBackfillProgress,
  getNowMilliseconds,
  sleep,
  slowestPageDurationMilliseconds,
}: ImportNextFirefliesTranscriptPageParams): Promise<ImportMissingFirefliesCallsResult> => {
  const pageStartedAtMilliseconds = getNowMilliseconds();
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
      await pauseBeforeFirefliesBackfillContinuation({
        deadlineAtMilliseconds,
        getNowMilliseconds,
        sleep,
      });

      return {
        stopReason: isRateLimited ? 'rate-limited' : 'retryable-error',
        ...firefliesBackfillProgress,
        continuationCursor: cursor,
      };
    }

    return {
      stopReason: 'list-failed',
      ...firefliesBackfillProgress,
      continuationCursor: cursor,
      listErrorMessage: listFirefliesTranscriptsResult.errorMessage,
    };
  }

  const firefliesCallSummaries = listFirefliesTranscriptsResult.data;

  if (firefliesCallSummaries.length === 0) {
    return {
      stopReason: 'exhausted',
      ...firefliesBackfillProgress,
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
    deadlineAtMilliseconds,
    getNowMilliseconds,
    sleep,
  });
  const nextFirefliesBackfillProgress = addPageToFirefliesBackfillProgress({
    firefliesBackfillProgress,
    pageResult: pageSyncResult,
  });

  if (pageSyncResult.status === 'deadline') {
    return {
      stopReason: 'deadline',
      ...nextFirefliesBackfillProgress,
      continuationCursor: pageSyncResult.continuationCursor,
    };
  }

  if (
    pageSyncResult.status === 'rate-limited' ||
    pageSyncResult.status === 'retryable-error'
  ) {
    await pauseBeforeFirefliesBackfillContinuation({
      deadlineAtMilliseconds,
      getNowMilliseconds,
      sleep,
    });

    return {
      stopReason: pageSyncResult.status,
      ...nextFirefliesBackfillProgress,
      continuationCursor: pageSyncResult.continuationCursor,
    };
  }

  if (firefliesCallSummaries.length < FIREFLIES_BACKFILL_PAGE_SIZE) {
    return {
      stopReason: 'exhausted',
      ...nextFirefliesBackfillProgress,
    };
  }

  const nextCursor = {
    ...cursor,
    skip: cursor.skip + firefliesCallSummaries.length,
  };
  const nextSlowestPageDurationMilliseconds = Math.max(
    slowestPageDurationMilliseconds,
    getNowMilliseconds() - pageStartedAtMilliseconds,
  );

  if (
    getNowMilliseconds() + nextSlowestPageDurationMilliseconds >
    deadlineAtMilliseconds
  ) {
    return {
      stopReason: 'deadline',
      ...nextFirefliesBackfillProgress,
      continuationCursor: nextCursor,
    };
  }

  return importNextFirefliesTranscriptPage({
    apiKey,
    coreApiClient,
    cursor: nextCursor,
    deadlineAtMilliseconds,
    firefliesBackfillProgress: nextFirefliesBackfillProgress,
    getNowMilliseconds,
    sleep,
    slowestPageDurationMilliseconds: nextSlowestPageDurationMilliseconds,
  });
};

export const importMissingFirefliesCalls = ({
  apiKey,
  coreApiClient,
  cursor,
  deadlineAtMilliseconds,
  getNowMilliseconds = () => Date.now(),
  sleep = sleepForMilliseconds,
}: ImportMissingFirefliesCallsParams): Promise<ImportMissingFirefliesCallsResult> =>
  importNextFirefliesTranscriptPage({
    apiKey,
    coreApiClient,
    cursor,
    deadlineAtMilliseconds,
    firefliesBackfillProgress: {
      pageCount: 0,
      importedCallCount: 0,
      erroredCallCount: 0,
      skippedCallCount: 0,
    },
    getNowMilliseconds,
    sleep,
    slowestPageDurationMilliseconds: 0,
  });
