import { beforeEach, describe, expect, it, vi } from 'vitest';

import reconcileDivergedCallRecordingsLogicFunction, {
  reconcileDivergedCallRecordingsHandler,
} from 'src/logic-functions/reconcile-diverged-call-recordings';
import { RECONCILE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN } from 'src/logic-functions/constants/reconcile-diverged-call-recordings-cron-pattern';

const reconcileDivergedCallRecordingsMock = vi.hoisted(() => vi.fn());
const coreApiClientMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/logic-functions/flows/reconcile-diverged-call-recordings.util',
  () => ({
    reconcileDivergedCallRecordings: reconcileDivergedCallRecordingsMock,
  }),
);

describe('reconcile-diverged-call-recordings', () => {
  beforeEach(() => {
    reconcileDivergedCallRecordingsMock.mockReset();
    reconcileDivergedCallRecordingsMock.mockResolvedValue({
      candidateCount: 0,
      updatedCallRecordingIds: [],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: [],
      unconvergeableCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
    coreApiClientMock.mockReset();
  });

  it('declares the batched Recall reconciliation safety net as a lower-frequency cron', () => {
    expect(reconcileDivergedCallRecordingsLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-diverged-call-recordings',
        timeoutSeconds: 250,
        cronTriggerSettings: {
          pattern: RECONCILE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN,
        },
      }),
    );
  });

  it('runs reconciliation with a workspace-scoped client and current timestamp', async () => {
    const result = await reconcileDivergedCallRecordingsHandler();

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(reconcileDivergedCallRecordingsMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      now: expect.any(Date),
    });
    expect(result).toEqual({
      candidateCount: 0,
      updatedCallRecordingIds: [],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: [],
      unconvergeableCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
  });

  it('returns a step failure instead of failing the cron run', async () => {
    reconcileDivergedCallRecordingsMock.mockRejectedValue(new Error('boom'));

    const result = await reconcileDivergedCallRecordingsHandler();

    expect(result).toEqual({
      error: 'diverged call recording reconciliation failed',
    });
  });
});
