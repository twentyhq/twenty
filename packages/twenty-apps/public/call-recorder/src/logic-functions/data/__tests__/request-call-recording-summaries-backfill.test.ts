import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { requestCallRecordingSummariesBackfill } from 'src/logic-functions/data/request-call-recording-summaries-backfill.util';

const fetchMock = vi.fn();

describe('requestCallRecordingSummariesBackfill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('posts an empty body to the summary generation route', async () => {
    const result = await requestCallRecordingSummariesBackfill();

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(
      `https://acme.functions.example.com${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
    );
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(JSON.stringify({}));
  });

  it('reports a kickoff that failed to fire', async () => {
    fetchMock.mockRejectedValue(new Error('Network failed'));

    await expect(requestCallRecordingSummariesBackfill()).resolves.toBe(false);
  });
});
