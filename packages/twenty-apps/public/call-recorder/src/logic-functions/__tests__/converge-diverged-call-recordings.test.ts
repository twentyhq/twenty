import { beforeEach, describe, expect, it, vi } from 'vitest';

import convergeDivergedCallRecordingsLogicFunction, {
  convergeDivergedCallRecordingsHandler,
} from 'src/logic-functions/converge-diverged-call-recordings';
import { CONVERGE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN } from 'src/logic-functions/constants/converge-diverged-call-recordings-cron-pattern';

const convergeDivergedCallRecordingsMock = vi.hoisted(() => vi.fn());
const coreApiClientMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/logic-functions/flows/converge-diverged-call-recordings.util',
  () => ({
    convergeDivergedCallRecordings: convergeDivergedCallRecordingsMock,
  }),
);

describe('converge-diverged-call-recordings', () => {
  beforeEach(() => {
    convergeDivergedCallRecordingsMock.mockReset();
    convergeDivergedCallRecordingsMock.mockResolvedValue({
      candidateCount: 0,
      updatedCallRecordingIds: [],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: [],
      unconvergeableCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
    coreApiClientMock.mockReset();
  });

  it('declares the batched Recall convergence safety net as a lower-frequency cron', () => {
    expect(convergeDivergedCallRecordingsLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'converge-diverged-call-recordings',
        timeoutSeconds: 250,
        cronTriggerSettings: {
          pattern: CONVERGE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN,
        },
      }),
    );
  });

  it('runs convergence with a workspace-scoped client and current timestamp', async () => {
    const result = await convergeDivergedCallRecordingsHandler();

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(convergeDivergedCallRecordingsMock).toHaveBeenCalledWith({
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
    convergeDivergedCallRecordingsMock.mockRejectedValue(new Error('boom'));

    const result = await convergeDivergedCallRecordingsHandler();

    expect(result).toEqual({
      error: 'call recording status convergence failed',
    });
  });
});
