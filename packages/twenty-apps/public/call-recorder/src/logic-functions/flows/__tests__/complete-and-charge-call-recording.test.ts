import { beforeEach, describe, expect, it, vi } from 'vitest';

const completeCallRecordingIngestionMock = vi.hoisted(() => vi.fn());
const chargeCompletedCallRecordingMock = vi.hoisted(() => vi.fn());
const updateCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/data/complete-call-recording-ingestion.util',
  () => ({
    completeCallRecordingIngestion: completeCallRecordingIngestionMock,
  }),
);

vi.mock(
  'src/logic-functions/flows/charge-completed-call-recording.util',
  () => ({
    chargeCompletedCallRecording: chargeCompletedCallRecordingMock,
  }),
);

vi.mock('src/logic-functions/data/update-call-recording.util', () => ({
  updateCallRecording: updateCallRecordingMock,
}));

import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

describe('completeAndChargeCallRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chargeCompletedCallRecordingMock.mockResolvedValue('charged');
  });

  it('charges exactly once when this path wins the completion claim', async () => {
    completeCallRecordingIngestionMock.mockResolvedValue(true);

    const claimed = await completeAndChargeCallRecording({} as never, {
      id: 'call-recording-1',
      startedAt: '2026-06-10T12:00:00.000Z',
      endedAt: '2026-06-10T13:00:00.000Z',
    });

    expect(claimed).toBe(true);
    expect(completeCallRecordingIngestionMock).toHaveBeenCalledWith(
      {},
      { id: 'call-recording-1' },
    );
    expect(chargeCompletedCallRecordingMock).toHaveBeenCalledTimes(1);
    expect(chargeCompletedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T12:00:00.000Z',
      endedAt: '2026-06-10T13:00:00.000Z',
    });
    expect(updateCallRecordingMock).not.toHaveBeenCalled();
  });

  it('does not charge when another path already completed the recording', async () => {
    completeCallRecordingIngestionMock.mockResolvedValue(false);

    const claimed = await completeAndChargeCallRecording({} as never, {
      id: 'call-recording-1',
      startedAt: '2026-06-10T12:00:00.000Z',
      endedAt: '2026-06-10T13:00:00.000Z',
    });

    expect(claimed).toBe(false);
    expect(chargeCompletedCallRecordingMock).not.toHaveBeenCalled();
  });

  it('reopens the completion claim when the charge is definitely rejected', async () => {
    completeCallRecordingIngestionMock.mockResolvedValue(true);
    chargeCompletedCallRecordingMock.mockResolvedValue('rejected');

    const claimed = await completeAndChargeCallRecording({} as never, {
      id: 'call-recording-1',
      startedAt: '2026-06-10T12:00:00.000Z',
      endedAt: '2026-06-10T13:00:00.000Z',
    });

    expect(claimed).toBe(false);
    expect(updateCallRecordingMock).toHaveBeenCalledWith(
      {},
      {
        id: 'call-recording-1',
        data: { status: 'PROCESSING' },
      },
    );
  });

  it('keeps the recording completed when the charge outcome is ambiguous', async () => {
    completeCallRecordingIngestionMock.mockResolvedValue(true);
    chargeCompletedCallRecordingMock.mockResolvedValue('unknown');

    const claimed = await completeAndChargeCallRecording({} as never, {
      id: 'call-recording-1',
      startedAt: '2026-06-10T12:00:00.000Z',
      endedAt: '2026-06-10T13:00:00.000Z',
    });

    expect(claimed).toBe(true);
    expect(updateCallRecordingMock).not.toHaveBeenCalled();
  });

  it('keeps the recording completed when billing is disabled on the instance', async () => {
    completeCallRecordingIngestionMock.mockResolvedValue(true);
    chargeCompletedCallRecordingMock.mockResolvedValue('billing-disabled');

    const claimed = await completeAndChargeCallRecording({} as never, {
      id: 'call-recording-1',
      startedAt: '2026-06-10T12:00:00.000Z',
      endedAt: '2026-06-10T13:00:00.000Z',
    });

    expect(claimed).toBe(true);
    expect(updateCallRecordingMock).not.toHaveBeenCalled();
  });
});
