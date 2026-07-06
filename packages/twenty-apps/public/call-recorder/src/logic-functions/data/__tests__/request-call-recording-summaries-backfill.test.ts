import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { requestCallRecordingSummariesBackfill } from 'src/logic-functions/data/request-call-recording-summaries-backfill.util';

const postMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: vi.fn(function RestApiClient() {
    return {
      post: postMock,
    };
  }),
}));

describe('requestCallRecordingSummariesBackfill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockResolvedValue({});
  });

  it('posts an empty body to the summary generation route', async () => {
    const result = await requestCallRecordingSummariesBackfill();

    expect(result).toBe(true);
    expect(postMock).toHaveBeenCalledWith(
      `/s${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
      {},
      { signal: expect.any(AbortSignal) },
    );
  });

  it('treats timeout as a successfully flushed request', async () => {
    const timeoutError = new Error('Timed out');
    timeoutError.name = 'TimeoutError';
    postMock.mockRejectedValue(timeoutError);

    await expect(requestCallRecordingSummariesBackfill()).resolves.toBe(true);
  });

  it('returns false when the kickoff request fails before flushing', async () => {
    postMock.mockRejectedValue(new Error('Network failed'));

    await expect(requestCallRecordingSummariesBackfill()).resolves.toBe(false);
  });
});
