import { beforeEach, describe, expect, it, vi } from 'vitest';

import cancelBeyondHorizonCallRecordingsLogicFunction, {
  cancelBeyondHorizonCallRecordingsHandler,
} from 'src/logic-functions/cancel-beyond-horizon-call-recordings';

const cancelBeyondHorizonCallRecordingsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock(
  'src/logic-functions/flows/cancel-beyond-horizon-call-recordings.util',
  () => ({
    cancelBeyondHorizonCallRecordings: cancelBeyondHorizonCallRecordingsMock,
  }),
);

const RESULT = {
  candidateCount: 1,
  canceledCallRecordingIds: ['call-recording-1'],
};

describe('cancelBeyondHorizonCallRecordingsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cancelBeyondHorizonCallRecordingsMock.mockResolvedValue(RESULT);
  });

  it('is configured as a daily cron', () => {
    expect(cancelBeyondHorizonCallRecordingsLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'cancel-beyond-horizon-call-recordings',
        timeoutSeconds: 250,
        cronTriggerSettings: { pattern: '30 4 * * *' },
      }),
    );
  });

  it('cancels beyond-horizon call recordings and returns the result', async () => {
    const result = await cancelBeyondHorizonCallRecordingsHandler();

    expect(cancelBeyondHorizonCallRecordingsMock).toHaveBeenCalledWith(
      expect.objectContaining({ now: expect.any(Date) }),
    );
    expect(result).toEqual(RESULT);
  });
});
