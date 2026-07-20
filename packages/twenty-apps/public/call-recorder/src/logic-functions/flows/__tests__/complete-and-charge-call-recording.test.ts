import { beforeEach, describe, expect, it, vi } from 'vitest';

const chargeCreditsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: chargeCreditsMock,
}));

import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

describe('completeAndChargeCallRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chargeCreditsMock.mockResolvedValue(undefined);
  });

  it('charges exactly once when this path wins the completion claim', async () => {
    const mutationMock = vi.fn(async () => ({
      updateCallRecordings: [{ id: 'call-recording-1' }],
    }));

    const claimed = await completeAndChargeCallRecording(
      { mutation: mutationMock } as never,
      {
        id: 'call-recording-1',
        startedAt: '2026-06-10T12:00:00.000Z',
        endedAt: '2026-06-10T13:00:00.000Z',
      },
    );

    expect(claimed).toBe(true);
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            status: { in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'] },
          },
          data: { status: 'COMPLETED' },
        },
        id: true,
      },
    });
    expect(chargeCreditsMock).toHaveBeenCalledTimes(1);
    expect(chargeCreditsMock).toHaveBeenCalledWith({
      creditsUsedMicro: 1_000_000,
      quantity: 60,
      operationType: 'CALL_RECORDING',
      resourceContext: 'recall',
    });
  });

  it('does not charge when another path already completed the recording', async () => {
    const mutationMock = vi.fn(async () => ({ updateCallRecordings: [] }));

    const claimed = await completeAndChargeCallRecording(
      { mutation: mutationMock } as never,
      {
        id: 'call-recording-1',
        startedAt: '2026-06-10T12:00:00.000Z',
        endedAt: '2026-06-10T13:00:00.000Z',
      },
    );

    expect(claimed).toBe(false);
    expect(chargeCreditsMock).not.toHaveBeenCalled();
  });
});
