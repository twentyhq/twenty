import { beforeEach, describe, expect, it, vi } from 'vitest';

import syncStaleCallRecordingsLogicFunction, {
  syncStaleCallRecordingsHandler,
} from 'src/logic-functions/sync-stale-call-recordings';
import { SYNC_STALE_CALL_RECORDINGS_CRON_PATTERN } from 'src/logic-functions/constants/sync-stale-call-recordings-cron-pattern';

const syncStaleCallRecordingsMock = vi.hoisted(() => vi.fn());
const coreApiClientMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/flows/sync-stale-call-recordings.util', () => ({
  syncStaleCallRecordings: syncStaleCallRecordingsMock,
}));

describe('sync-stale-call-recordings', () => {
  beforeEach(() => {
    syncStaleCallRecordingsMock.mockReset();
    syncStaleCallRecordingsMock.mockResolvedValue({
      candidateCount: 0,
      updatedCallRecordingIds: [],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: [],
      unsyncedCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
    coreApiClientMock.mockReset();
  });

  it('declares the batched stale-recording sync as a lower-frequency cron', () => {
    expect(syncStaleCallRecordingsLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'sync-stale-call-recordings',
        timeoutSeconds: 250,
        cronTriggerSettings: {
          pattern: SYNC_STALE_CALL_RECORDINGS_CRON_PATTERN,
        },
      }),
    );
  });

  it('runs sync with a workspace-scoped client and current timestamp', async () => {
    const result = await syncStaleCallRecordingsHandler();

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(syncStaleCallRecordingsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      now: expect.any(Date),
    });
    expect(result).toEqual({
      candidateCount: 0,
      updatedCallRecordingIds: [],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: [],
      unsyncedCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
  });

  it('returns a step failure instead of failing the cron run', async () => {
    syncStaleCallRecordingsMock.mockRejectedValue(new Error('boom'));

    const result = await syncStaleCallRecordingsHandler();

    expect(result).toEqual({
      error: 'stale call recording sync failed',
    });
  });
});
