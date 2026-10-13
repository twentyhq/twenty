import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { processTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/process-teams-transcript-history-page-or-throw';

const {
  kvStore,
  enqueueJobsMock,
  listTeamsCalendarPageMock,
  importTeamsTranscriptHistoryPageMock,
} = vi.hoisted(() => ({
  kvStore: new Map<string, unknown>(),
  enqueueJobsMock: vi.fn(),
  listTeamsCalendarPageMock: vi.fn(),
  importTeamsTranscriptHistoryPageMock: vi.fn(),
}));

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: { IS_TRANSCRIPT_IMPORT_ENABLED: true },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: {
    get: async (key: string) => kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      kvStore.set(key, value);
    },
  },
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
  () => ({ listTeamsOccurrenceTranscripts: vi.fn().mockResolvedValue([]) }),
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
  pageIndex: 2,
  attempt: 0,
};

const NEXT_JOB = { ...JOB, pageIndex: 3, nextPageUrl: NEXT_PAGE_URL };

const STATE = {
  runId: 'run-1',
  windowStart: '2026-08-15T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  phase: 'importing',
  pageCount: 2,
  updatedAt: '2026-09-15T00:10:00.000Z',
};

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
    listTeamsCalendarPageMock.mockResolvedValue({
      occurrences: [],
      nextPageUrl: NEXT_PAGE_URL,
    });
    importTeamsTranscriptHistoryPageMock.mockResolvedValue(2);
  });

  it('should save the page before scheduling the next one a minute later', async () => {
    let stateWhenScheduled: unknown;

    kvStore.set(STATE_KV_KEY, STATE);
    enqueueJobsMock.mockImplementation(async () => {
      stateWhenScheduled = kvStore.get(STATE_KV_KEY);
    });

    await processTeamsTranscriptHistoryPageOrThrow(JOB);

    expect(stateWhenScheduled).toMatchObject({
      phase: 'importing',
      pageCount: 3,
      nextJob: NEXT_JOB,
    });
    expect(getEnqueuedJobs()).toEqual([{ payload: NEXT_JOB, delayMs: 60_000 }]);
  });

  it('should schedule the next page right away when the page imported nothing', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    importTeamsTranscriptHistoryPageMock.mockResolvedValue(0);

    await processTeamsTranscriptHistoryPageOrThrow(JOB);

    expect(getEnqueuedJobs()).toEqual([{ payload: NEXT_JOB, delayMs: 0 }]);
  });

  it('should finish the run on the last calendar page', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockResolvedValue({ occurrences: [] });

    await processTeamsTranscriptHistoryPageOrThrow(JOB);

    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({
      phase: 'imported',
      pageCount: 3,
    });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should only schedule the saved next page when a retried page was already saved', async () => {
    kvStore.set(STATE_KV_KEY, { ...STATE, pageCount: 3, nextJob: NEXT_JOB });

    await expect(
      processTeamsTranscriptHistoryPageOrThrow(JOB),
    ).resolves.toEqual(expect.objectContaining({ skipped: true }));
    expect(listTeamsCalendarPageMock).not.toHaveBeenCalled();
    expect(getEnqueuedJobs()).toEqual([{ payload: NEXT_JOB, delayMs: 0 }]);
  });

  it.each([
    ['was replaced by another run', { ...STATE, runId: 'run-2' }],
    ['moved past this page', { ...STATE, pageCount: 5 }],
    ['failed', { ...STATE, phase: 'failed' }],
  ])('should leave a run alone when it %s', async (_, state) => {
    kvStore.set(STATE_KV_KEY, state);

    await expect(
      processTeamsTranscriptHistoryPageOrThrow(JOB),
    ).resolves.toEqual(expect.objectContaining({ skipped: true }));
    expect(kvStore.get(STATE_KV_KEY)).toBe(state);
    expect(listTeamsCalendarPageMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should retry a failed page later and keep the run from looking stalled', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockRejectedValue(buildGraphRequestError(503));

    await processTeamsTranscriptHistoryPageOrThrow(JOB);

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
    ['its last retry failed', 3, buildGraphRequestError(503)],
    [
      'an admin disabled transcripts',
      0,
      buildGraphRequestError(403, 'GraphAccessToTranscriptsDisabled'),
    ],
    [
      'its connection needs reconnecting',
      0,
      new AppConnectionAuthFailedError('connected-account-1'),
    ],
  ])('should fail the run when %s', async (_, attempt, error) => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockRejectedValue(error);

    await expect(
      processTeamsTranscriptHistoryPageOrThrow({ ...JOB, attempt }),
    ).resolves.toEqual(expect.objectContaining({ success: false }));
    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({ phase: 'failed' });
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should retry a rejected token, since a page can outlive its token', async () => {
    kvStore.set(STATE_KV_KEY, STATE);
    listTeamsCalendarPageMock.mockRejectedValue(buildGraphRequestError(401));

    await processTeamsTranscriptHistoryPageOrThrow({ ...JOB, attempt: 1 });

    expect(kvStore.get(STATE_KV_KEY)).toMatchObject({ phase: 'importing' });
    expect(getEnqueuedJobs()).toEqual([
      { payload: { ...JOB, attempt: 2 }, delayMs: 5 * 60_000 },
    ]);
  });

  it('should reject a malformed job without touching the run', async () => {
    kvStore.set(STATE_KV_KEY, STATE);

    await expect(
      processTeamsTranscriptHistoryPageOrThrow({ ...JOB, pageIndex: -1 }),
    ).resolves.toEqual(expect.objectContaining({ success: false }));
    expect(kvStore.get(STATE_KV_KEY)).toBe(STATE);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
