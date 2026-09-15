import { describe, expect, it, vi } from 'vitest';

import { cancelOpenScheduledCallRecordingRequests } from 'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util';

const shouldAlwaysStartRequest = () => true;

describe('cancelOpenScheduledCallRecordingRequests', () => {
  it('cancels explicit recording ids in batches of at most 200', async () => {
    const capturedMutationArguments: Array<{
      filter: unknown;
      data: unknown;
    }> = [];
    const mutation = vi.fn(async (mutationArgument: any) => {
      const updateCallRecordingsArguments =
        mutationArgument.updateCallRecordings.__args;

      capturedMutationArguments.push(updateCallRecordingsArguments);

      return {
        updateCallRecordings: updateCallRecordingsArguments.filter.id.in.map(
          (id: string) => ({ id }),
        ),
      };
    });
    const callRecordingIds = Array.from(
      { length: 201 },
      (_, index) => `call-recording-${index + 1}`,
    );

    const canceledCallRecordingRequestCount =
      await cancelOpenScheduledCallRecordingRequests(
        { mutation } as never,
        callRecordingIds,
        shouldAlwaysStartRequest,
      );

    expect(canceledCallRecordingRequestCount).toBe(201);
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(capturedMutationArguments[0]?.filter).toEqual({
      id: { in: callRecordingIds.slice(0, 200) },
      recordingRequestStatus: { eq: 'REQUESTED' },
      status: { eq: 'SCHEDULED' },
    });
    expect(capturedMutationArguments[1]?.filter).toEqual({
      id: { in: callRecordingIds.slice(200) },
      recordingRequestStatus: { eq: 'REQUESTED' },
      status: { eq: 'SCHEDULED' },
    });
    expect(capturedMutationArguments[0]?.data).toEqual({
      recordingRequestStatus: 'CANCELED',
    });
  });

  it('returns zero without issuing a mutation when no id is provided', async () => {
    const mutation = vi.fn(async () => ({ updateCallRecordings: [] }));

    const canceledCallRecordingRequestCount =
      await cancelOpenScheduledCallRecordingRequests(
        { mutation } as never,
        [],
        shouldAlwaysStartRequest,
      );

    expect(canceledCallRecordingRequestCount).toBe(0);
    expect(mutation).not.toHaveBeenCalled();
  });

  it('counts an omitted result list as zero for its batch', async () => {
    const mutation = vi.fn(async () => ({}));

    const canceledCallRecordingRequestCount =
      await cancelOpenScheduledCallRecordingRequests(
        { mutation } as never,
        ['call-recording-1'],
        shouldAlwaysStartRequest,
      );

    expect(canceledCallRecordingRequestCount).toBe(0);
  });

  it('attempts later batches before surfacing an earlier batch failure', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ updateCallRecordings: [] })
      .mockRejectedValueOnce(new Error('Second batch failed'))
      .mockResolvedValueOnce({ updateCallRecordings: [] });
    const callRecordingIds = Array.from(
      { length: 401 },
      (_, index) => `call-recording-${index + 1}`,
    );

    await expect(
      cancelOpenScheduledCallRecordingRequests(
        { mutation } as never,
        callRecordingIds,
        shouldAlwaysStartRequest,
      ),
    ).rejects.toThrow('1 of 3 call recording update batches failed');
    expect(mutation).toHaveBeenCalledTimes(3);
  });

  it('stops starting update batches at the request cutoff', async () => {
    const mutation = vi.fn(async (mutationArgument: any) => ({
      updateCallRecordings:
        mutationArgument.updateCallRecordings.__args.filter.id.in.map(
          (id: string) => ({ id }),
        ),
    }));
    const shouldStartBatchRequest = vi
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const callRecordingIds = Array.from(
      { length: 201 },
      (_, index) => `call-recording-${index + 1}`,
    );

    await expect(
      cancelOpenScheduledCallRecordingRequests(
        { mutation } as never,
        callRecordingIds,
        shouldStartBatchRequest,
      ),
    ).rejects.toThrow(
      'call recording update request cutoff reached before all batches were attempted',
    );
    expect(mutation).toHaveBeenCalledTimes(1);
  });
});
