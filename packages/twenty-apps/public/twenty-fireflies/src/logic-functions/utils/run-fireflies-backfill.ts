import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { FIREFLIES_BACKFILL_PACING_MS } from 'src/logic-functions/constants/fireflies-backfill-pacing-ms';
import { FIREFLIES_BACKFILL_PAGE_SIZE } from 'src/logic-functions/constants/fireflies-backfill-page-size';
import { FIREFLIES_BACKFILL_RATE_LIMIT_PAUSE_MS } from 'src/logic-functions/constants/fireflies-backfill-rate-limit-pause-ms';
import { type FirefliesCallSummary } from 'src/logic-functions/types/fireflies-call-list-result.type';
import { listFirefliesTranscripts } from 'src/logic-functions/utils/list-fireflies-transcripts';
import { requestFirefliesBackfill } from 'src/logic-functions/utils/request-fireflies-backfill';
import {
  type FirefliesSyncableField,
  syncFirefliesCallToCallRecording,
} from 'src/logic-functions/utils/sync-fireflies-call-to-call-recording';

const HTTP_TOO_MANY_REQUESTS = 429;

// Both fields upsert the same CallRecording row, so they must run
// sequentially per call — same rule as the manual Sync Fireflies Call.
const SYNCED_FIELDS: FirefliesSyncableField[] = ['transcript', 'summary'];

export type RunFirefliesBackfillStopReason =
  | 'exhausted'
  | 'deadline'
  | 'rate-limited'
  | 'list-failed';

export type RunFirefliesBackfillResult = {
  stopReason: RunFirefliesBackfillStopReason;
  pageCount: number;
  syncedCallCount: number;
  erroredCallCount: number;
  skippedCallCount: number;
  continuationRequested: boolean;
  continuationCursor?: string;
  listErrorMessage?: string;
};

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getCallDateMs = (call: FirefliesCallSummary): number | undefined => {
  if (!isDefined(call.date)) {
    return undefined;
  }

  const dateMs = Date.parse(call.date);

  return Number.isNaN(dateMs) ? undefined : dateMs;
};

// Pages through Fireflies history newest-first with a sliding toDate window:
// each page lists the newest calls at or before the cursor, syncs them, then
// moves the cursor to the oldest date seen. Date cursors make the sweep
// restart-safe — any run can be re-invoked with { fromDate, cursor } and the
// deterministic CallRecording ids make re-syncing the window boundary a
// no-op — unlike skip-based pagination, which shifts under new recordings.
export const runFirefliesBackfill = async ({
  apiKey,
  client,
  fromDate,
  cursor,
  deadlineAtMs,
  getNowMs = () => Date.now(),
  sleep = defaultSleep,
}: {
  apiKey: string;
  client: CoreApiClient;
  fromDate: string;
  cursor?: string;
  deadlineAtMs: number;
  getNowMs?: () => number;
  sleep?: (ms: number) => Promise<void>;
}): Promise<RunFirefliesBackfillResult> => {
  let currentCursor = cursor;
  let pageCount = 0;
  let syncedCallCount = 0;
  let erroredCallCount = 0;
  let skippedCallCount = 0;
  let slowestPageMs = 0;

  const buildResult = (
    stopReason: RunFirefliesBackfillStopReason,
    extras: Partial<RunFirefliesBackfillResult> = {},
  ): RunFirefliesBackfillResult => ({
    stopReason,
    pageCount,
    syncedCallCount,
    erroredCallCount,
    skippedCallCount,
    continuationRequested: false,
    ...extras,
  });

  // Waiting before the continuation fires keeps the self-invoke chain from
  // hammering a rate-limited API; the next run retries from the cursor.
  const stopForRateLimit = async (
    resumeCursor: string | undefined,
  ): Promise<RunFirefliesBackfillResult> => {
    const pauseMs = Math.min(
      FIREFLIES_BACKFILL_RATE_LIMIT_PAUSE_MS,
      Math.max(0, deadlineAtMs - getNowMs()),
    );

    if (pauseMs > 0) {
      await sleep(pauseMs);
    }

    const continuationRequested = await requestFirefliesBackfill({
      fromDate,
      cursor: resumeCursor,
    });

    return buildResult('rate-limited', {
      continuationRequested,
      continuationCursor: resumeCursor,
    });
  };

  while (true) {
    const pageStartedAtMs = getNowMs();
    const listResult = await listFirefliesTranscripts({
      apiKey,
      fromDate,
      toDate: currentCursor,
      limit: FIREFLIES_BACKFILL_PAGE_SIZE,
    });

    if (!listResult.ok) {
      if (listResult.status === HTTP_TOO_MANY_REQUESTS) {
        return stopForRateLimit(currentCursor);
      }

      // A hard list failure is surfaced instead of retried: re-invoking on an
      // unknown error (bad API key, Fireflies outage) would loop forever. The
      // cursor in the result lets an operator resume manually.
      return buildResult('list-failed', {
        listErrorMessage: listResult.errorMessage,
        continuationCursor: currentCursor,
      });
    }

    if (listResult.data.length === 0) {
      return buildResult('exhausted');
    }

    pageCount += 1;

    // Fireflies returns transcripts newest-first; sort defensively so a
    // mid-page stop can resume from the current call's date without losing
    // the older, still-unprocessed calls.
    const calls = [...listResult.data].sort(
      (a, b) =>
        (getCallDateMs(b) ?? Number.NEGATIVE_INFINITY) -
        (getCallDateMs(a) ?? Number.NEGATIVE_INFINITY),
    );

    for (const call of calls) {
      const callDateMs = getCallDateMs(call);
      // Resuming with this call's date (inclusive) re-lists it plus
      // everything older; re-syncing the boundary call is idempotent.
      const resumeCursor = isDefined(callDateMs)
        ? new Date(callDateMs).toISOString()
        : currentCursor;
      let callUpdated = false;
      let callErrored = false;

      for (const field of SYNCED_FIELDS) {
        const syncResult = await syncFirefliesCallToCallRecording({
          apiKey,
          client,
          transcriptId: call.id,
          field,
        });

        if (
          syncResult.status === 'error' &&
          syncResult.httpStatus === HTTP_TOO_MANY_REQUESTS
        ) {
          return stopForRateLimit(resumeCursor);
        }

        callUpdated = callUpdated || syncResult.status === 'updated';
        callErrored = callErrored || syncResult.status === 'error';

        await sleep(FIREFLIES_BACKFILL_PACING_MS);
      }

      if (callUpdated) {
        syncedCallCount += 1;
      } else if (callErrored) {
        erroredCallCount += 1;
      } else {
        skippedCallCount += 1;
      }
    }

    const oldestDatedCallMs = calls.reduce<number | undefined>(
      (oldestMs, call) => {
        const callDateMs = getCallDateMs(call);

        if (!isDefined(callDateMs)) {
          return oldestMs;
        }

        return isDefined(oldestMs) ? Math.min(oldestMs, callDateMs) : callDateMs;
      },
      undefined,
    );

    // A short page means history is exhausted; a page without any dated call
    // cannot slide the window, so it has to be the last one.
    if (
      calls.length < FIREFLIES_BACKFILL_PAGE_SIZE ||
      !isDefined(oldestDatedCallMs)
    ) {
      return buildResult('exhausted');
    }

    let nextCursor = new Date(oldestDatedCallMs).toISOString();

    if (nextCursor === currentCursor) {
      // Degenerate full page at a single timestamp: step past it by one
      // millisecond so the window always makes progress.
      nextCursor = new Date(oldestDatedCallMs - 1).toISOString();
    }

    currentCursor = nextCursor;

    slowestPageMs = Math.max(slowestPageMs, getNowMs() - pageStartedAtMs);

    if (getNowMs() + slowestPageMs > deadlineAtMs) {
      const continuationRequested = await requestFirefliesBackfill({
        fromDate,
        cursor: currentCursor,
      });

      return buildResult('deadline', {
        continuationRequested,
        continuationCursor: currentCursor,
      });
    }
  }
};
