import { beforeEach, describe, expect, it, vi } from 'vitest';

import applicationConfig from 'src/application-config';
import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';

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
      operation: 'recordMeeting',
      creditsUsedMicro: 500_000,
      quantity: 30,
    });
  });

  it('charges an operation the application declares as call recording', async () => {
    await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    const [{ operation }] = chargeCreditsMock.mock.calls[0];

    expect(applicationConfig.config.billing?.operations?.[operation]).toEqual({
      operationType: 'CALL_RECORDING',
      label: 'Meeting recording',
    });
  });

  it('skips and warns loudly when timestamps are unusable', async () => {
    await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: undefined,
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeCreditsMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('will not be billed'),
    );
  });
});
