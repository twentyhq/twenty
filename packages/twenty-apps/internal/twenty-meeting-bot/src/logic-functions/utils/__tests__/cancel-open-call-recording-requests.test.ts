import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelOpenCallRecordingRequests } from 'src/logic-functions/utils/cancel-open-call-recording-requests.util';

const findOpenScheduledCallRecordingsMock = vi.hoisted(() => vi.fn());
const cancelCallRecordingRequestMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/utils/find-open-scheduled-call-recordings.util',
  () => ({
    findOpenScheduledCallRecordings: findOpenScheduledCallRecordingsMock,
  }),
);

vi.mock('src/logic-functions/utils/cancel-call-recording-request.util', () => ({
  cancelCallRecordingRequest: cancelCallRecordingRequestMock,
}));

const client = {} as CoreApiClient;

describe('cancelOpenCallRecordingRequests', () => {
  beforeEach(() => {
    findOpenScheduledCallRecordingsMock.mockReset();
    cancelCallRecordingRequestMock.mockReset();
    cancelCallRecordingRequestMock.mockResolvedValue(undefined);
  });

  it('cancels every open scheduled request', async () => {
    const openCallRecordings = [
      { id: 'call-recording-1', externalBotId: 'recall-bot-1' },
      { id: 'call-recording-2', externalBotId: null },
    ];

    findOpenScheduledCallRecordingsMock.mockResolvedValue(openCallRecordings);

    const result = await cancelOpenCallRecordingRequests({ client });

    expect(result).toEqual({
      canceledCallRecordingIds: ['call-recording-1', 'call-recording-2'],
    });
    expect(cancelCallRecordingRequestMock).toHaveBeenCalledTimes(2);
    expect(cancelCallRecordingRequestMock).toHaveBeenCalledWith({
      client,
      callRecording: openCallRecordings[0],
    });
    expect(cancelCallRecordingRequestMock).toHaveBeenCalledWith({
      client,
      callRecording: openCallRecordings[1],
    });
  });

  it('does nothing when no request is open', async () => {
    findOpenScheduledCallRecordingsMock.mockResolvedValue([]);

    const result = await cancelOpenCallRecordingRequests({ client });

    expect(result).toEqual({ canceledCallRecordingIds: [] });
    expect(cancelCallRecordingRequestMock).not.toHaveBeenCalled();
  });
});
