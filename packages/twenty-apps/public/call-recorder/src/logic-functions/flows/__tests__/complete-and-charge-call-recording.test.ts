import { beforeEach, describe, expect, it, vi } from 'vitest';

const completeCallRecordingIngestionMock = vi.hoisted(() => vi.fn());
const chargeCompletedCallRecordingMock = vi.hoisted(() => vi.fn());

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

import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

describe('completeAndChargeCallRecording', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
