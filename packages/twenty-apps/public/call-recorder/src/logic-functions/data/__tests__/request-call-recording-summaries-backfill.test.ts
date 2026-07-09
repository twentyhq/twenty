import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { requestCallRecordingSummariesBackfill } from 'src/logic-functions/data/request-call-recording-summaries-backfill.util';

const postToOwnRouteMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/data/post-to-own-route.util', () => ({
  postToOwnRoute: postToOwnRouteMock,
}));

describe('requestCallRecordingSummariesBackfill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postToOwnRouteMock.mockResolvedValue(true);
  });

  it('posts an empty body to the summary generation route', async () => {
    const result = await requestCallRecordingSummariesBackfill();

    expect(result).toBe(true);
    expect(postToOwnRouteMock).toHaveBeenCalledWith({
      path: GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
      body: {},
    });
  });

  it('reports a kickoff that failed to fire', async () => {
    postToOwnRouteMock.mockResolvedValue(false);

    await expect(requestCallRecordingSummariesBackfill()).resolves.toBe(false);
  });
});
