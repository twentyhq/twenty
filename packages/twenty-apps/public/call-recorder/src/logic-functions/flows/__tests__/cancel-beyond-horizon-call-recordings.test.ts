import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelBeyondHorizonCallRecordings } from 'src/logic-functions/flows/cancel-beyond-horizon-call-recordings.util';

const findScheduledCallRecordingsBeyondHorizonMock = vi.hoisted(() => vi.fn());
const cancelCallRecordingRequestMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/data/find-scheduled-call-recordings-beyond-horizon.util',
  () => ({
    findScheduledCallRecordingsBeyondHorizon:
      findScheduledCallRecordingsBeyondHorizonMock,
  }),
);

vi.mock('src/logic-functions/flows/cancel-call-recording-request.util', () => ({
  cancelCallRecordingRequest: cancelCallRecordingRequestMock,
}));

const NOW = new Date('2026-07-04T12:00:00.000Z');
const CLIENT = {} as unknown as CoreApiClient;

describe('cancelBeyondHorizonCallRecordings', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    findScheduledCallRecordingsBeyondHorizonMock.mockReset();
    cancelCallRecordingRequestMock.mockReset();
    cancelCallRecordingRequestMock.mockResolvedValue(undefined);
  });

  it('cancels every beyond-horizon recording it finds', async () => {
    const beyondHorizonCallRecordings = [
      { id: 'call-recording-1', externalBotId: 'bot-1' },
      { id: 'call-recording-2', externalBotId: undefined },
    ];

    findScheduledCallRecordingsBeyondHorizonMock.mockResolvedValue(
      beyondHorizonCallRecordings,
    );

    const result = await cancelBeyondHorizonCallRecordings({
      client: CLIENT,
      now: NOW,
    });

    expect(cancelCallRecordingRequestMock).toHaveBeenCalledTimes(2);
    expect(cancelCallRecordingRequestMock).toHaveBeenCalledWith({
      client: CLIENT,
      callRecording: beyondHorizonCallRecordings[0],
    });
    expect(result).toEqual({
      candidateCount: 2,
      canceledCallRecordingIds: ['call-recording-1', 'call-recording-2'],
    });
  });

  it('continues cancelling the batch when one cancellation throws', async () => {
    findScheduledCallRecordingsBeyondHorizonMock.mockResolvedValue([
      { id: 'call-recording-1', externalBotId: 'bot-1' },
      { id: 'call-recording-2', externalBotId: 'bot-2' },
    ]);
    cancelCallRecordingRequestMock
      .mockRejectedValueOnce(new Error('core unavailable'))
      .mockResolvedValueOnce(undefined);

    const result = await cancelBeyondHorizonCallRecordings({
      client: CLIENT,
      now: NOW,
    });

    expect(cancelCallRecordingRequestMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      candidateCount: 2,
      canceledCallRecordingIds: ['call-recording-2'],
    });
  });

  it('does nothing when no beyond-horizon recordings exist', async () => {
    findScheduledCallRecordingsBeyondHorizonMock.mockResolvedValue([]);

    const result = await cancelBeyondHorizonCallRecordings({
      client: CLIENT,
      now: NOW,
    });

    expect(cancelCallRecordingRequestMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      candidateCount: 0,
      canceledCallRecordingIds: [],
    });
  });
});
