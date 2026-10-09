import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';
import { buildFathomRateLimitError } from 'src/__tests__/utils/build-fathom-rate-limit-error.util';
import { buildFathomServerError } from 'src/__tests__/utils/build-fathom-server-error.util';
import {
  FATHOM_IMPORT_SLOT_INTERVAL_MILLISECONDS,
  MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS,
} from 'src/constants/fathom.constant';
import { FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';

const mocks = vi.hoisted(() => ({
  enqueueJobs: vi.fn(),
  getConnection: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  getRecordingTranscript: vi.fn(),
  getRecordingSummary: vi.fn(),
  syncFathomMeetingsToCallRecordings: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: mocks.enqueueJobs,
  getConnection: mocks.getConnection,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

vi.mock('fathom-typescript', () => ({
  Fathom: class Fathom {
    getRecordingTranscript = mocks.getRecordingTranscript;
    getRecordingSummary = mocks.getRecordingSummary;
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock(
  'src/logic-functions/utils/sync-fathom-meetings-to-call-recordings.util',
  () => ({
    syncFathomMeetingsToCallRecordings:
      mocks.syncFathomMeetingsToCallRecordings,
  }),
);

const { fathomBackfillBatchHandler } =
  await import('src/logic-functions/fathom-backfill-batch');

const NOW = new Date('2026-09-05T12:00:00.000Z');
const MEETINGS = [1, 2, 3].map((recordingId) =>
  serializeFathomMeeting(buildFathomMeeting({ recordingId })),
);
const PAYLOAD = { connectedAccountId: 'connection-1', meetings: MEETINGS };

type SyncMeetingsInput = {
  meetings: Array<{ recordingId: number }>;
  onMeetingSynced?: (result: {
    callRecordingId: string;
    created: boolean;
  }) => void;
};

const syncMeetingsUntil =
  (failingRecordingId?: number) =>
  async ({ meetings, onMeetingSynced }: SyncMeetingsInput) => {
    for (const meeting of meetings) {
      if (meeting.recordingId === failingRecordingId) {
        throw new RetryableLogicFunctionError('rate limited');
      }

      onMeetingSynced?.({
        callRecordingId: computeCallRecordingIdForFathomMeeting(
          meeting.recordingId,
        ),
        created: true,
      });
    }

    return [];
  };

const getSyncedRecordingIds = () =>
  mocks.syncFathomMeetingsToCallRecordings.mock.calls.map((call) => {
    const input: SyncMeetingsInput = call[0];

    return input.meetings.map(({ recordingId }) => recordingId);
  });

const failTranscriptFor = (recordingId: number, error: unknown) =>
  mocks.getRecordingTranscript.mockImplementation(
    async (request: { recordingId: number }) => {
      if (request.recordingId === recordingId) {
        throw error;
      }

      return { transcript: [] };
    },
  );

describe('fathomBackfillBatchHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.getConnection.mockResolvedValue({
      id: 'connection-1',
      accessToken: 'token-1',
    });
    mocks.kvGet.mockResolvedValue(null);
    mocks.getRecordingTranscript.mockResolvedValue({ transcript: [] });
    mocks.getRecordingSummary.mockResolvedValue({ summary: null });
    mocks.syncFathomMeetingsToCallRecordings.mockImplementation(
      syncMeetingsUntil(),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('re-enqueues only the meetings left after a rate limit, after Retry-After', async () => {
    failTranscriptFor(2, buildFathomRateLimitError('120'));

    const result = await fathomBackfillBatchHandler(PAYLOAD);

    expect(result).toMatchObject({
      success: true,
      importedMeetingCount: 1,
      requeuedMeetingCount: 2,
    });
    expect(getSyncedRecordingIds()).toEqual([[1]]);
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
        payloads: [
          {
            connectedAccountId: 'connection-1',
            meetings: MEETINGS.slice(1),
            requeueAttempt: 1,
          },
        ],
        delayMs: 120_000,
      }),
    );
  });

  it('waits behind batches already scheduled for the connection', async () => {
    const nextBatchAvailableAt = NOW.getTime() + 10 * 60_000;

    mocks.kvGet.mockResolvedValue({ nextBatchAvailableAt });
    failTranscriptFor(1, buildFathomServerError());

    await fathomBackfillBatchHandler(PAYLOAD);

    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ delayMs: 10 * 60_000 }),
    );
    expect(mocks.kvSet).toHaveBeenCalledExactlyOnceWith(
      'fathom-backfill-schedule:connection-1',
      {
        nextBatchAvailableAt:
          nextBatchAvailableAt + FATHOM_IMPORT_SLOT_INTERVAL_MILLISECONDS,
      },
    );
  });

  it('saves the whole batch together and re-enqueues only the meetings it could not save', async () => {
    mocks.syncFathomMeetingsToCallRecordings.mockImplementation(
      syncMeetingsUntil(3),
    );

    const result = await fathomBackfillBatchHandler({
      ...PAYLOAD,
      requeueAttempt: 2,
    });

    expect(result).toMatchObject({
      success: true,
      importedMeetingCount: 2,
      requeuedMeetingCount: 1,
    });
    expect(getSyncedRecordingIds()).toEqual([[1, 2, 3]]);
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        payloads: [
          {
            connectedAccountId: 'connection-1',
            meetings: MEETINGS.slice(2),
            requeueAttempt: 3,
          },
        ],
        delayMs: 60_000,
      }),
    );
  });

  it('hands a save that fails for good back to the platform without re-enqueueing', async () => {
    mocks.syncFathomMeetingsToCallRecordings.mockRejectedValueOnce(
      new Error('Invalid record'),
    );

    await expect(fathomBackfillBatchHandler(PAYLOAD)).rejects.toBeInstanceOf(
      RetryableLogicFunctionError,
    );
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('saves the meetings read before a rate limit and re-enqueues the rest with both delays honored', async () => {
    failTranscriptFor(3, buildFathomRateLimitError('120'));
    mocks.syncFathomMeetingsToCallRecordings.mockImplementation(
      syncMeetingsUntil(2),
    );

    const result = await fathomBackfillBatchHandler(PAYLOAD);

    expect(result).toMatchObject({
      success: true,
      importedMeetingCount: 1,
      requeuedMeetingCount: 2,
    });
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        payloads: [
          {
            connectedAccountId: 'connection-1',
            meetings: MEETINGS.slice(1),
            requeueAttempt: 1,
          },
        ],
        delayMs: 120_000,
      }),
    );
  });

  it('hands the batch back to the platform once the re-enqueue budget is spent', async () => {
    failTranscriptFor(1, buildFathomRateLimitError('30'));

    await expect(
      fathomBackfillBatchHandler({
        ...PAYLOAD,
        requeueAttempt: MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS,
      }),
    ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('hands the batch back to the platform when the re-enqueue fails', async () => {
    failTranscriptFor(2, buildFathomRateLimitError('120'));
    mocks.enqueueJobs.mockResolvedValue({ enqueued: false });

    await expect(fathomBackfillBatchHandler(PAYLOAD)).rejects.toBeInstanceOf(
      RetryableLogicFunctionError,
    );
    expect(mocks.enqueueJobs).toHaveBeenCalledOnce();
  });

  it('skips a recording Fathom rejects permanently and imports the rest', async () => {
    failTranscriptFor(2, buildFathomNotFoundError());

    const result = await fathomBackfillBatchHandler(PAYLOAD);

    expect(result).toMatchObject({
      success: true,
      importedMeetingCount: 2,
      failedMeetingCount: 1,
      requeuedMeetingCount: 0,
    });
    expect(getSyncedRecordingIds()).toEqual([[1, 3]]);
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });
});
