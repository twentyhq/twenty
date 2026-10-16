import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { importTeamsTranscriptOrScheduleRetry } from 'src/features/transcripts/logic-functions/utils/import-teams-transcript-or-schedule-retry';

const { syncTeamsTranscriptMock, enqueueRetryMock } = vi.hoisted(() => ({
  syncTeamsTranscriptMock: vi.fn(),
  enqueueRetryMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getConnection: vi.fn().mockResolvedValue({ accessToken: 'token' }),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/sync-teams-transcript-to-call-recording-or-throw',
  () => ({
    syncTeamsTranscriptToCallRecordingOrThrow: syncTeamsTranscriptMock,
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-import-retry-or-throw',
  () => ({ enqueueTeamsTranscriptImportRetryOrThrow: enqueueRetryMock }),
);

const SYNC_RESULT = {
  callRecordingId: 'call-recording-1',
  status: 'COMPLETED',
  created: true,
  skipped: false,
  isSpeakerAttributed: true,
};

const importTranscript = () =>
  importTeamsTranscriptOrScheduleRetry({
    connectedAccountId: 'connected-account-1',
    meetingId: 'meeting-1',
    transcriptId: 'transcript-1',
    attempt: 1,
  });

describe('importTeamsTranscriptOrScheduleRetry', () => {
  const consoleWarnSpy = vi.spyOn(console, 'warn');

  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy.mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockReset();
  });

  it('should warn that the tenant withholds speaker names when it imports a transcript without them', async () => {
    syncTeamsTranscriptMock.mockResolvedValue({
      ...SYNC_RESULT,
      isSpeakerAttributed: false,
    });

    await expect(importTranscript()).resolves.toEqual({ outcome: 'imported' });
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Include speaker attribution'),
    );
  });

  it('should not warn when the transcript has its speakers', async () => {
    syncTeamsTranscriptMock.mockResolvedValue(SYNC_RESULT);

    await expect(importTranscript()).resolves.toEqual({ outcome: 'imported' });
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should only warn once the transcript is imported, not on each retry', async () => {
    syncTeamsTranscriptMock.mockResolvedValue({
      ...SYNC_RESULT,
      status: 'PROCESSING',
      isSpeakerAttributed: false,
    });

    await expect(importTranscript()).resolves.toEqual({
      outcome: 'retry-scheduled',
    });
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
