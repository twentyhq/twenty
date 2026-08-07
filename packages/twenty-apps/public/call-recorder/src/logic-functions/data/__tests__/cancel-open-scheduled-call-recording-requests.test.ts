import { describe, expect, it, vi } from 'vitest';

import { cancelOpenScheduledCallRecordingRequests } from 'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util';

describe('cancelOpenScheduledCallRecordingRequests', () => {
  it('flips every open scheduled request to canceled and returns the ids', async () => {
    let capturedArgs: { filter: unknown; data: unknown } | undefined;
    const mutation = vi.fn(async (mutationArg: any) => {
      capturedArgs = mutationArg.updateCallRecordings.__args;

      return {
        updateCallRecordings: [
          { id: 'call-recording-1' },
          { id: 'call-recording-2' },
        ],
      };
    });

    const canceledCallRecordingIds =
      await cancelOpenScheduledCallRecordingRequests({ mutation } as never);

    expect(canceledCallRecordingIds).toEqual([
      'call-recording-1',
      'call-recording-2',
    ]);
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(capturedArgs?.filter).toEqual({
      recordingRequestStatus: { eq: 'REQUESTED' },
      status: { eq: 'SCHEDULED' },
    });
    expect(capturedArgs?.data).toEqual({ recordingRequestStatus: 'CANCELED' });
  });

  it('returns an empty list when no request is open', async () => {
    const mutation = vi.fn(async () => ({ updateCallRecordings: [] }));

    const canceledCallRecordingIds =
      await cancelOpenScheduledCallRecordingRequests({ mutation } as never);

    expect(canceledCallRecordingIds).toEqual([]);
  });

  it('returns an empty list when the API omits the result list', async () => {
    const mutation = vi.fn(async () => ({}));

    const canceledCallRecordingIds =
      await cancelOpenScheduledCallRecordingRequests({ mutation } as never);

    expect(canceledCallRecordingIds).toEqual([]);
  });
});
