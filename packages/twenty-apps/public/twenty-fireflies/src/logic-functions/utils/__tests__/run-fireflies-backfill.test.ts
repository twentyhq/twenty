import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FirefliesCallSummary } from 'src/logic-functions/types/fireflies-call-list-result.type';
import { runFirefliesBackfill } from 'src/logic-functions/utils/run-fireflies-backfill';

const listFirefliesTranscriptsMock = vi.hoisted(() => vi.fn());
const syncFirefliesCallToCallRecordingMock = vi.hoisted(() => vi.fn());
const requestFirefliesBackfillMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/list-fireflies-transcripts', () => ({
  listFirefliesTranscripts: listFirefliesTranscriptsMock,
}));

vi.mock('src/logic-functions/utils/sync-fireflies-call-to-call-recording', () => ({
  syncFirefliesCallToCallRecording: syncFirefliesCallToCallRecordingMock,
}));

vi.mock('src/logic-functions/utils/request-fireflies-backfill', () => ({
  requestFirefliesBackfill: requestFirefliesBackfillMock,
}));

const CLIENT = {} as CoreApiClient;
const FROM_DATE = '2026-04-06T00:00:00.000Z';
const PAGE_SIZE = 50;

const buildCall = (
  index: number,
  dateMs: number,
): FirefliesCallSummary => ({
  id: `call-${index}`,
  title: `Call ${index}`,
  date: new Date(dateMs).toISOString(),
  durationMinutes: 30,
  participants: [],
  hostEmail: null,
  transcriptUrl: null,
  meetingLink: null,
});

// Newest-first page: call index 0 is the newest.
const buildPage = (count: number, newestDateMs: number): FirefliesCallSummary[] =>
  Array.from({ length: count }, (_, index) =>
    buildCall(index, newestDateMs - index * 60_000),
  );

const listOk = (calls: FirefliesCallSummary[]) => ({
  ok: true as const,
  status: 200,
  data: calls,
});

const noopSleep = () => Promise.resolve();

const runWithDefaults = (
  overrides: Partial<Parameters<typeof runFirefliesBackfill>[0]> = {},
) =>
  runFirefliesBackfill({
    apiKey: 'api-key',
    client: CLIENT,
    fromDate: FROM_DATE,
    deadlineAtMs: Date.now() + 600_000,
    sleep: noopSleep,
    ...overrides,
  });

describe('runFirefliesBackfill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    syncFirefliesCallToCallRecordingMock.mockResolvedValue({
      status: 'updated',
      field: 'transcript',
      callRecordingId: 'call-recording-1',
      created: true,
    });
    requestFirefliesBackfillMock.mockResolvedValue(true);
  });

  it('syncs transcript then summary sequentially for every call on a single page', async () => {
    const calls = buildPage(2, Date.parse('2026-07-01T10:00:00.000Z'));

    listFirefliesTranscriptsMock.mockResolvedValueOnce(listOk(calls));

    const result = await runWithDefaults();

    expect(result.stopReason).toBe('exhausted');
    expect(result.pageCount).toBe(1);
    expect(result.syncedCallCount).toBe(2);
    expect(syncFirefliesCallToCallRecordingMock).toHaveBeenCalledTimes(4);
    expect(
      syncFirefliesCallToCallRecordingMock.mock.calls.map((call) => [
        call[0].transcriptId,
        call[0].field,
      ]),
    ).toEqual([
      ['call-0', 'transcript'],
      ['call-0', 'summary'],
      ['call-1', 'transcript'],
      ['call-1', 'summary'],
    ]);
    expect(requestFirefliesBackfillMock).not.toHaveBeenCalled();
  });

  it('slides the toDate window to the oldest date of each full page', async () => {
    const newestDateMs = Date.parse('2026-07-01T10:00:00.000Z');
    const firstPage = buildPage(PAGE_SIZE, newestDateMs);
    const oldestFirstPageDate = firstPage[PAGE_SIZE - 1].date;
    const secondPage = buildPage(3, Date.parse('2026-06-20T10:00:00.000Z'));

    listFirefliesTranscriptsMock
      .mockResolvedValueOnce(listOk(firstPage))
      .mockResolvedValueOnce(listOk(secondPage));

    const result = await runWithDefaults();

    expect(result.stopReason).toBe('exhausted');
    expect(result.pageCount).toBe(2);
    expect(result.syncedCallCount).toBe(PAGE_SIZE + 3);
    expect(listFirefliesTranscriptsMock).toHaveBeenNthCalledWith(1, {
      apiKey: 'api-key',
      fromDate: FROM_DATE,
      toDate: undefined,
      limit: PAGE_SIZE,
    });
    expect(listFirefliesTranscriptsMock).toHaveBeenNthCalledWith(2, {
      apiKey: 'api-key',
      fromDate: FROM_DATE,
      toDate: oldestFirstPageDate,
      limit: PAGE_SIZE,
    });
  });

  it('resumes listing from the provided cursor', async () => {
    const cursor = '2026-06-15T00:00:00.000Z';

    listFirefliesTranscriptsMock.mockResolvedValueOnce(listOk([]));

    await runWithDefaults({ cursor });

    expect(listFirefliesTranscriptsMock).toHaveBeenCalledWith({
      apiKey: 'api-key',
      fromDate: FROM_DATE,
      toDate: cursor,
      limit: PAGE_SIZE,
    });
  });

  it('steps the cursor one millisecond back when a full page sits on a single timestamp', async () => {
    const stuckDateMs = Date.parse('2026-07-01T10:00:00.000Z');
    const stuckCursor = new Date(stuckDateMs).toISOString();
    const stuckPage = Array.from({ length: PAGE_SIZE }, (_, index) =>
      buildCall(index, stuckDateMs),
    );

    listFirefliesTranscriptsMock
      .mockResolvedValueOnce(listOk(stuckPage))
      .mockResolvedValueOnce(listOk([]));

    const result = await runWithDefaults({ cursor: stuckCursor });

    expect(result.stopReason).toBe('exhausted');
    expect(listFirefliesTranscriptsMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        toDate: new Date(stuckDateMs - 1).toISOString(),
      }),
    );
  });

  it('stops before the deadline and requests a continuation with the next cursor', async () => {
    const newestDateMs = Date.parse('2026-07-01T10:00:00.000Z');
    const fullPage = buildPage(PAGE_SIZE, newestDateMs);
    const oldestDate = fullPage[PAGE_SIZE - 1].date;

    listFirefliesTranscriptsMock.mockResolvedValue(listOk(fullPage));

    // Clock advances 5s per reading: after one page, now + slowest page
    // overshoots the deadline.
    let nowMs = 0;
    const getNowMs = () => {
      nowMs += 5_000;

      return nowMs;
    };

    const result = await runWithDefaults({ deadlineAtMs: 15_000, getNowMs });

    expect(result.stopReason).toBe('deadline');
    expect(result.pageCount).toBe(1);
    expect(result.continuationRequested).toBe(true);
    expect(result.continuationCursor).toBe(oldestDate);
    expect(requestFirefliesBackfillMock).toHaveBeenCalledWith({
      fromDate: FROM_DATE,
      cursor: oldestDate,
    });
  });

  it('stops on a 429 from a call sync, pauses, and continues from that call', async () => {
    const calls = buildPage(3, Date.parse('2026-07-01T10:00:00.000Z'));

    listFirefliesTranscriptsMock.mockResolvedValueOnce(listOk(calls));
    syncFirefliesCallToCallRecordingMock
      .mockResolvedValueOnce({
        status: 'updated',
        field: 'transcript',
        callRecordingId: 'call-recording-1',
        created: true,
      })
      .mockResolvedValueOnce({
        status: 'updated',
        field: 'summary',
        callRecordingId: 'call-recording-1',
        created: false,
      })
      .mockResolvedValueOnce({
        status: 'error',
        field: 'transcript',
        error: 'Fireflies API responded with HTTP 429',
        httpStatus: 429,
      });

    const sleep = vi.fn().mockResolvedValue(undefined);

    const result = await runWithDefaults({
      deadlineAtMs: Date.now() + 600_000,
      sleep,
    });

    expect(result.stopReason).toBe('rate-limited');
    expect(result.continuationRequested).toBe(true);
    // The rate-limited call is the second of the page, so the resume window
    // must still include it (inclusive toDate at its own date).
    expect(result.continuationCursor).toBe(calls[1].date);
    expect(requestFirefliesBackfillMock).toHaveBeenCalledWith({
      fromDate: FROM_DATE,
      cursor: calls[1].date,
    });
    // Paused before firing the continuation.
    expect(sleep).toHaveBeenCalledWith(60_000);
    // No further sync after the 429.
    expect(syncFirefliesCallToCallRecordingMock).toHaveBeenCalledTimes(3);
  });

  it('stops on a 429 from the list query and continues from the same cursor', async () => {
    const cursor = '2026-06-15T00:00:00.000Z';

    listFirefliesTranscriptsMock.mockResolvedValueOnce({
      ok: false as const,
      status: 429,
      errorMessage: 'Fireflies API responded with HTTP 429',
    });

    const result = await runWithDefaults({ cursor });

    expect(result.stopReason).toBe('rate-limited');
    expect(result.continuationCursor).toBe(cursor);
    expect(requestFirefliesBackfillMock).toHaveBeenCalledWith({
      fromDate: FROM_DATE,
      cursor,
    });
  });

  it('surfaces a hard list failure without requesting a continuation', async () => {
    listFirefliesTranscriptsMock.mockResolvedValueOnce({
      ok: false as const,
      status: 401,
      errorMessage: 'Fireflies API responded with HTTP 401',
    });

    const result = await runWithDefaults();

    expect(result.stopReason).toBe('list-failed');
    expect(result.listErrorMessage).toBe(
      'Fireflies API responded with HTTP 401',
    );
    expect(result.continuationRequested).toBe(false);
    expect(requestFirefliesBackfillMock).not.toHaveBeenCalled();
  });

  it('keeps sweeping when a single call errors without a 429', async () => {
    const calls = buildPage(2, Date.parse('2026-07-01T10:00:00.000Z'));

    listFirefliesTranscriptsMock.mockResolvedValueOnce(listOk(calls));
    syncFirefliesCallToCallRecordingMock
      .mockResolvedValueOnce({
        status: 'error',
        field: 'transcript',
        error: 'Fireflies API responded with HTTP 500',
        httpStatus: 500,
      })
      .mockResolvedValueOnce({
        status: 'error',
        field: 'summary',
        error: 'Fireflies API responded with HTTP 500',
        httpStatus: 500,
      })
      .mockResolvedValue({
        status: 'updated',
        field: 'transcript',
        callRecordingId: 'call-recording-2',
        created: true,
      });

    const result = await runWithDefaults();

    expect(result.stopReason).toBe('exhausted');
    expect(result.erroredCallCount).toBe(1);
    expect(result.syncedCallCount).toBe(1);
  });

  it('counts a call as skipped when both fields have no content', async () => {
    const calls = buildPage(1, Date.parse('2026-07-01T10:00:00.000Z'));

    listFirefliesTranscriptsMock.mockResolvedValueOnce(listOk(calls));
    syncFirefliesCallToCallRecordingMock.mockResolvedValue({
      status: 'skipped',
      field: 'transcript',
      reason: 'nothing to sync',
    });

    const result = await runWithDefaults();

    expect(result.stopReason).toBe('exhausted');
    expect(result.skippedCallCount).toBe(1);
    expect(result.syncedCallCount).toBe(0);
  });

  it('finishes when the window has no calls at all', async () => {
    listFirefliesTranscriptsMock.mockResolvedValueOnce(listOk([]));

    const result = await runWithDefaults();

    expect(result.stopReason).toBe('exhausted');
    expect(result.pageCount).toBe(0);
    expect(syncFirefliesCallToCallRecordingMock).not.toHaveBeenCalled();
  });

  it('paces every per-field sync', async () => {
    const calls = buildPage(2, Date.parse('2026-07-01T10:00:00.000Z'));

    listFirefliesTranscriptsMock.mockResolvedValueOnce(listOk(calls));

    const sleep = vi.fn().mockResolvedValue(undefined);

    await runWithDefaults({ sleep });

    // 2 calls × 2 fields = 4 pacing pauses.
    expect(sleep).toHaveBeenCalledTimes(4);
    expect(sleep).toHaveBeenCalledWith(1_000);
  });
});
