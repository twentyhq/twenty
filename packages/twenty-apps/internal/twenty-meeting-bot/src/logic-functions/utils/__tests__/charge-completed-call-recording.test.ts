import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chargeCompletedCallRecording } from 'src/logic-functions/utils/charge-completed-call-recording.util';

const chargeCreditsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: chargeCreditsMock,
}));

describe('chargeCompletedCallRecording', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    chargeCreditsMock.mockReset();
    chargeCreditsMock.mockResolvedValue(undefined);
  });

  it('charges prorated micro-credits with the recording duration in minutes', async () => {
    await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeCreditsMock).toHaveBeenCalledWith({
      creditsUsedMicro: 500_000,
      quantity: 30,
      operationType: 'CALL_RECORDING',
      resourceContext: 'recall',
    });
  });

  it('skips and warns loudly when timestamps are unusable', async () => {
    await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: null,
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeCreditsMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('will not be billed'),
    );
  });
});
