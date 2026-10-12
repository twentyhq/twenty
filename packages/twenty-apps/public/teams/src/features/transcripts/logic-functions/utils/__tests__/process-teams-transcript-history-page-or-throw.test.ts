import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { processTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/process-teams-transcript-history-page-or-throw';

const {
  kvGetMock,
  kvSetMock,
  getConnectionMock,
  enqueueJobsMock,
  listTeamsCalendarPageMock,
  listTeamsOccurrenceTranscriptsMock,
  importTeamsTranscriptHistoryPageMock,
} = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
  getConnectionMock: vi.fn(),
  enqueueJobsMock: vi.fn(),
  listTeamsCalendarPageMock: vi.fn(),
  listTeamsOccurrenceTranscriptsMock: vi.fn(),
  importTeamsTranscriptHistoryPageMock: vi.fn(),
}));

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: { IS_TRANSCRIPT_IMPORT_ENABLED: true },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  kv: { get: kvGetMock, set: kvSetMock },
  getConnection: getConnectionMock,
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
    listTeamsOccurrenceTranscripts: listTeamsOccurrenceTranscriptsMock,
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/import-teams-transcript-history-page-or-throw',
  () => ({
    importTeamsTranscriptHistoryPageOrThrow:
      importTeamsTranscriptHistoryPageMock,
  }),
);

const NEXT_PAGE_URL =
  'https://graph.microsoft.com/v1.0/me/calendarView?$skiptoken=abc';

const JOB = {
  connectedAccountId: 'connected-account-1',
  runId: 'run-1',
  chunkIndex: 0,
  pageIndex: 2,
  attempt: 0,
};

const NEXT_JOB = {
  ...JOB,
  pageIndex: 3,
  nextPageUrl: NEXT_PAGE_URL,
};

const STATE = {
  runId: 'run-1',
  windowStart: '2026-08-15T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  phase: 'importing',
  pageCount: 2,
  importedCount: 4,
  skippedCount: 1,
  unavailableCount: 0,
  updatedAt: '2026-09-15T00:10:00.000Z',
};

describe('processTeamsTranscriptHistoryPageOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    getConnectionMock.mockResolvedValue({ accessToken: 'token' });
    enqueueJobsMock.mockResolvedValue(undefined);
    listTeamsCalendarPageMock.mockResolvedValue({
      occurrences: [],
      nextPageUrl: NEXT_PAGE_URL,
    });
    listTeamsOccurrenceTranscriptsMock.mockResolvedValue({
      transcripts: [],
      unavailableMeetingCount: 1,
    });
    importTeamsTranscriptHistoryPageMock.mockResolvedValue({
      importedCount: 2,
      skippedCount: 1,
      unavailableCount: 1,
    });
  });

  it('should save the page counts with the next page before scheduling it', async () => {
    kvGetMock.mockResolvedValue(STATE);

    await processTeamsTranscriptHistoryPageOrThrow({
      phase: 'importing',
      payload: JOB,
    });

    expect(importTeamsTranscriptHistoryPageMock).toHaveBeenCalledWith(
      expect.objectContaining({ importedSince: STATE.windowEnd }),
    );
    expect(kvSetMock).toHaveBeenCalledWith(
      'teams-transcript-history:connected-account-1',
      expect.objectContaining({
        pageCount: 3,
        importedCount: 6,
        skippedCount: 2,
        unavailableCount: 2,
        nextJob: NEXT_JOB,
      }),
    );
    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: [expect.objectContaining({ payload: NEXT_JOB })],
      }),
    );
  });

  it('should only schedule the saved next page when a retried page was already saved', async () => {
    kvGetMock.mockResolvedValue({
      ...STATE,
      pageCount: 3,
      nextJob: NEXT_JOB,
    });

    await expect(
      processTeamsTranscriptHistoryPageOrThrow({
        phase: 'importing',
        payload: JOB,
      }),
    ).resolves.toEqual(
      expect.objectContaining({ success: true, skipped: true }),
    );
    expect(getConnectionMock).not.toHaveBeenCalled();
    expect(listTeamsCalendarPageMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: [expect.objectContaining({ payload: NEXT_JOB })],
      }),
    );
  });

  it('should skip a page of a run that moved on', async () => {
    kvGetMock.mockResolvedValue({ ...STATE, pageCount: 5 });

    await expect(
      processTeamsTranscriptHistoryPageOrThrow({
        phase: 'importing',
        payload: JOB,
      }),
    ).resolves.toEqual(
      expect.objectContaining({ success: true, skipped: true }),
    );
    expect(enqueueJobsMock).not.toHaveBeenCalled();
    expect(kvSetMock).not.toHaveBeenCalled();
  });
});
