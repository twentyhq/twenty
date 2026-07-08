import { beforeEach, describe, expect, it, vi } from 'vitest';

import reconcileDivergedCallRecordingsLogicFunction, {
  reconcileDivergedCallRecordingsHandler,
} from 'src/logic-functions/reconcile-diverged-call-recordings';

const convergeDivergedCallRecordingsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock(
  'src/logic-functions/flows/converge-diverged-call-recordings.util',
  () => ({
    convergeDivergedCallRecordings: convergeDivergedCallRecordingsMock,
  }),
);

const CONVERGENCE_RESULT = {
  candidateCount: 2,
  updatedCallRecordingIds: ['call-recording-1'],
  markedFailedCallRecordingIds: [],
  requestedTranscriptCallRecordingIds: [],
  unconvergeableCallRecordingIds: [],
  skippedNotStartedCallRecordingIds: [],
};

describe('reconcileDivergedCallRecordingsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    convergeDivergedCallRecordingsMock.mockResolvedValue(CONVERGENCE_RESULT);
  });

  it('is configured as a low-frequency cron, less often than the 5-minute stale-state cron', () => {
    expect(reconcileDivergedCallRecordingsLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-diverged-call-recordings',
        timeoutSeconds: 250,
        cronTriggerSettings: { pattern: '*/15 * * * *' },
      }),
    );
  });

  it('converges diverged call recordings and returns the result', async () => {
    const result = await reconcileDivergedCallRecordingsHandler();

    expect(convergeDivergedCallRecordingsMock).toHaveBeenCalledWith(
      expect.objectContaining({ now: expect.any(Date) }),
    );
    expect(result).toEqual(CONVERGENCE_RESULT);
  });
});
