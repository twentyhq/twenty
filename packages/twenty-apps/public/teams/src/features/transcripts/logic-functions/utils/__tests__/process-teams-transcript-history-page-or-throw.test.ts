import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { TEAMS_COUNT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { listTeamsOccurrenceTranscripts } from 'src/features/transcripts/logic-functions/utils/list-teams-occurrence-transcripts';
import { processTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/process-teams-transcript-history-page-or-throw';

const {
  kvStore,
  enqueueJobsMock,
  listTeamsCalendarPageMock,
  importTeamsTranscriptHistoryPageMock,
  countTeamsTranscriptHistoryPageMock,
  listConnectionsMock,
} = vi.hoisted(() => ({
  kvStore: new Map<string, unknown>(),
  enqueueJobsMock: vi.fn(),
  listTeamsCalendarPageMock: vi.fn(),
  importTeamsTranscriptHistoryPageMock: vi.fn(),
  countTeamsTranscriptHistoryPageMock: vi.fn(),
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: {
    get: async (key: string) => kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      kvStore.set(key, value);
    },
    delete: async (key: string) => {
      kvStore.delete(key);
    },
  },
  listConnections: listConnectionsMock,
  getConnection: vi.fn().mockResolvedValue({ accessToken: 'token' }),
  enqueueJobs: enqueueJobsMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-teams-calendar-page',
  () => ({ listTeamsCalendarPage: listTeamsCalendarPageMock }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-teams-occurrence-transcripts',
  () => ({
    listTeamsOccurrenceTranscripts: vi
      .fn()
      .mockResolvedValue({ transcripts: [], unavailableMeetingCount: 1 }),
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/count-teams-transcript-history-page-or-throw',
  () => ({
    countTeamsTranscriptHistoryPageOrThrow: countTeamsTranscriptHistoryPageMock,
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/import-teams-transcript-history-page-or-throw',
  () => ({
    importTeamsTranscriptHistoryPageOrThrow:
      importTeamsTranscriptHistoryPageMock,
  }),
);

const STATE_KV_KEY = 'teams-transcript-history:connected-account-1';

const NEXT_PAGE_URL =
  'https://graph.microsoft.com/v1.0/me/calendarView?$skiptoken=abc';

const JOB = {
  connectedAccountId: 'connected-account-1',
  runId: 'run-1',
  chunkIndex: 0,
  pageIndex: 2,
  attempt: 0,
};

const NEXT_JOB = { ...JOB, pageIndex: 3, nextPageUrl: NEXT_PAGE_URL };

const STATE = {
  runId: 'run-1',
  days: 31,
  windowStart: '2026-08-15T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  phase: 'importing',
  transcriptCount: 0,
  alreadyImportedCount: 0,
  deletedCount: 0,
  pageCount: 2,
  importedCount: 4,
  skippedCount: 1,
  unavailableCount: 0,
  updatedAt: '2026-09-15T00:10:00.000Z',
};

const PAGE_COUNTS = {
  transcriptCount: 0,
  alreadyImportedCount: 0,
  deletedCount: 0,
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
};

const processImportPage = (
  payload: Parameters<
    typeof processTeamsTranscriptHistoryPageOrThrow
  >[0]['payload'],
) => processTeamsTranscriptHistoryPageOrThrow({ phase: 'importing', payload });

const buildGraphRequestError = (status: number, innerErrorCode?: string) =>
  new GraphRequestError({
    message: `Microsoft Graph request failed (${status})`,
    status,
    innerErrorCode,
  });

const getEnqueuedJobs = () =>
  enqueueJobsMock.mock.calls.map(([request]) => ({
    payload: request.jobs[0].payload,
    delayMs: request.delayMs,
  }));

describe('processTeamsTranscriptHistoryPageOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvStore.clear();
    process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    enqueueJobsMock.mockResolvedValue(undefined);
    listConnectionsMock.mockResolvedValue([{ id: 'connected-account-1' }]);
    listTeamsCalendarPageMock.mockResolvedValue({
      occurrences: [],
      nextPageUrl: NEXT_PAGE_URL,
    });
    importTeamsTranscriptHistoryPageMock.mockResolvedValue({
      ...PAGE_COUNTS,
      importedCount: 2,
      skippedCount: 1,
      unavailableCount: 1,
    });
  });

  it('should save the page before scheduling the next one a minute later', async () => {
    let stateWhenScheduled: unknown;

    kvStore.set(STATE_KV_KEY, STATE);
    enqueueJobsMock.mockImplementation(async () => {
      stateWhenScheduled = kvStore.get(STATE_KV_KEY);
    });

    await processImportPage(JOB);

    expect(stateWhenScheduled).toMatchObject({
      phase: 'importing',
      pageCount: 3,
      importedCount: 6,
      skippedCount: 2,
      unavailableCount: 2,
      nextJob: NEXT_JOB,
    });
    expect(importTeamsTranscriptHistoryPageMock).toHaveBeenCalledWith(
      expect.objectContaining({ importedSince: STATE.windowEnd }),
    );
    expect(getEnqueuedJobs()).toEqual([{ payload: NEXT_JOB, delayMs: 60_000 }]);
  });

  it('should schedule the next page right away when the page imported nothing', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    importTeamsTranscriptHistoryPageMock.mockResolvedValue(PAGE_COUNTS);

    await processImportPage(JOB);

    expect(getEnqueuedJobs()).toEqual([{ payload: NEXT_JOB, delayMs: 0 }]);
  });

  it('should leave a meeting that started before the chunk to the chunk that holds its start', async () => {
    const meetingInChunk = {
      joinWebUrl: 'in-chunk',
      startDateTime: '2026-09-01T10:00:00.000Z',
      endDateTime: '2026-09-01T10:30:00.000Z',
      calendarReference: { eventExternalId: 'event-in-chunk' },
    };
    const meetingBeforeChunk = {
      ...meetingInChunk,
      joinWebUrl: 'before-chunk',
      startDateTime: '2026-08-14T23:45:00.000Z',
      endDateTime: '2026-08-15T00:15:00.000Z',
    };

    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockResolvedValue({
      occurrences: [meetingBeforeChunk, meetingInChunk],
    });

    await processImportPage(JOB);

    expect(listTeamsOccurrenceTranscripts).toHaveBeenCalledWith(
      expect.objectContaining({ occurrences: [meetingInChunk] }),
    );
  });

  it('should finish the run on the last calendar page', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockResolvedValue({ occurrences: [] });

    await processImportPage(JOB);

    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({
      phase: 'imported',
      pageCount: 3,
    });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should count the last page of a count without importing it', async () => {
    kvStore.set(STATE_KV_KEY, {
      ...STATE,
      phase: 'counting',
      importedCount: 0,
    });
    listTeamsCalendarPageMock.mockResolvedValue({ occurrences: [] });
    countTeamsTranscriptHistoryPageMock.mockResolvedValue({
      ...PAGE_COUNTS,
      transcriptCount: 5,
      alreadyImportedCount: 2,
      deletedCount: 1,
    });

    await processTeamsTranscriptHistoryPageOrThrow({
      phase: 'counting',
      payload: JOB,
    });

    expect(importTeamsTranscriptHistoryPageMock).not.toHaveBeenCalled();
    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({
      phase: 'counted',
      transcriptCount: 5,
      alreadyImportedCount: 2,
      deletedCount: 1,
      unavailableCount: 1,
    });
  });

  it('should schedule the next page of a count on the count function', async () => {
    kvStore.set(STATE_KV_KEY, { ...STATE, phase: 'counting' });
    countTeamsTranscriptHistoryPageMock.mockResolvedValue(PAGE_COUNTS);

    await processTeamsTranscriptHistoryPageOrThrow({
      phase: 'counting',
      payload: JOB,
    });

    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          TEAMS_COUNT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('should stop a page whose run is removed while it imports', async () => {
    let wasRunActive: boolean | undefined;

    kvStore.set(STATE_KV_KEY, STATE);
    importTeamsTranscriptHistoryPageMock.mockImplementation(
      async ({ isRunActive }: { isRunActive: () => Promise<boolean> }) => {
        kvStore.delete(STATE_KV_KEY);
        wasRunActive = await isRunActive();

        return PAGE_COUNTS;
      },
    );

    await expect(processImportPage(JOB)).resolves.toEqual(
      expect.objectContaining({ skipped: true }),
    );
    expect(wasRunActive).toBe(false);
    expect(kvStore.has(STATE_KV_KEY)).toBe(false);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should not leave a run behind for a connection removed while its page was saved', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    listConnectionsMock.mockResolvedValue([]);

    await expect(processImportPage(JOB)).resolves.toEqual(
      expect.objectContaining({ skipped: true }),
    );
    expect(kvStore.has(STATE_KV_KEY)).toBe(false);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should only schedule the saved next page when a retried page was already saved', async () => {
    kvStore.set(STATE_KV_KEY, { ...STATE, pageCount: 3, nextJob: NEXT_JOB });

    await expect(processImportPage(JOB)).resolves.toEqual(
      expect.objectContaining({ skipped: true }),
    );
    expect(listTeamsCalendarPageMock).not.toHaveBeenCalled();
    expect(getEnqueuedJobs()).toEqual([{ payload: NEXT_JOB, delayMs: 0 }]);
  });

  it.each([
    ['was replaced by another run', { ...STATE, runId: 'run-2' }],
    ['moved past this page', { ...STATE, pageCount: 5 }],
    ['failed', { ...STATE, phase: 'failed' }],
  ])('should leave a run alone when it %s', async (_, state) => {
    kvStore.set(STATE_KV_KEY, state);

    await expect(processImportPage(JOB)).resolves.toEqual(
      expect.objectContaining({ skipped: true }),
    );
    expect(kvStore.get(STATE_KV_KEY)).toBe(state);
    expect(listTeamsCalendarPageMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should retry a failed page later and keep the run from looking stalled', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockRejectedValue(buildGraphRequestError(503));

    await processImportPage(JOB);

    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({
      phase: 'importing',
      pageCount: 2,
    });
    expect((kvStore.get(STATE_KV_KEY) as typeof STATE).updatedAt).not.toBe(
      STATE.updatedAt,
    );
    expect(getEnqueuedJobs()).toEqual([
      { payload: { ...JOB, attempt: 1 }, delayMs: 60_000 },
    ]);
  });

  it.each([
    ['its last retry failed', 3, buildGraphRequestError(503), 'unknown'],
    [
      'an admin disabled transcripts',
      0,
      buildGraphRequestError(403, 'GraphAccessToTranscriptsDisabled'),
      'transcripts-disabled-by-admin',
    ],
    [
      'its connection needs reconnecting',
      0,
      new AppConnectionAuthFailedError('connected-account-1'),
      'reconnect-required',
    ],
    [
      'its token was still rejected on the last retry',
      3,
      buildGraphRequestError(401),
      'reconnect-required',
    ],
  ])('should fail the run when %s', async (_, attempt, error, errorCode) => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockRejectedValue(error);

    await expect(processImportPage({ ...JOB, attempt })).resolves.toEqual(
      expect.objectContaining({ success: false }),
    );
    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({
      phase: 'failed',
      errorCode,
    });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should retry a rejected token, since a page can outlive its token', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockRejectedValue(buildGraphRequestError(401));

    await processImportPage({ ...JOB, attempt: 1 });

    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({ phase: 'importing' });
    expect(getEnqueuedJobs()).toEqual([
      { payload: { ...JOB, attempt: 2 }, delayMs: 5 * 60_000 },
    ]);
  });

  it('should reject a malformed job without touching the run', async () => {
    kvStore.set(STATE_KV_KEY, STATE);

    await expect(processImportPage({ ...JOB, pageIndex: -1 })).resolves.toEqual(
      expect.objectContaining({ success: false }),
    );
    expect(kvStore.get(STATE_KV_KEY)).toBe(STATE);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
