import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';

const requestAppBillingChargeMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/data/request-app-billing-charge.util', () => ({
  requestAppBillingCharge: requestAppBillingChargeMock,
}));

describe('chargeCompletedCallRecording', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    requestAppBillingChargeMock.mockReset();
    requestAppBillingChargeMock.mockResolvedValue('charged');
  });

  it('charges prorated micro-credits with the recording duration in minutes', async () => {
    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('charged');
    expect(requestAppBillingChargeMock).toHaveBeenCalledWith({
      creditsUsedMicro: 500_000,
      quantity: 30,
      operationType: 'CALL_RECORDING',
      resourceContext: 'recall',
    });
  });

  it('skips and warns loudly when timestamps are unusable', async () => {
    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: undefined,
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('unbillable');
    expect(requestAppBillingChargeMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('will not be billed'),
    );
  });

  it('surfaces a rejected charge so the caller can reopen completion', async () => {
    requestAppBillingChargeMock.mockResolvedValue('rejected');

    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('rejected');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('was rejected'),
    );
  });

  it('warns without failing when the charge outcome is unknown', async () => {
    requestAppBillingChargeMock.mockResolvedValue('unknown');

    const chargeOutcome = await chargeCompletedCallRecording({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:30:00.000Z',
    });

    expect(chargeOutcome).toBe('unknown');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('did not confirm'),
    );
  });
});
