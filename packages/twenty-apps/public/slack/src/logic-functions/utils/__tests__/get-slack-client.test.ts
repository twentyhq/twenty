import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

const { webClientMock, getSlackConnectionMock } = vi.hoisted(() => ({
  webClientMock: vi.fn(),
  getSlackConnectionMock: vi.fn(),
}));

vi.mock('@slack/web-api', () => ({
  WebClient: webClientMock,
}));

vi.mock('src/logic-functions/utils/get-slack-connection', () => ({
  getSlackConnection: getSlackConnectionMock,
}));

describe('getSlackClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSlackConnectionMock.mockResolvedValue({
      success: true,
      accessToken: 'xoxb-token',
    });
  });

  it('should bound retries and request time so a call cannot outlive its function', async () => {
    await getSlackClient();

    expect(webClientMock).toHaveBeenCalledWith('xoxb-token', {
      timeout: 3000,
      retryConfig: { retries: 1, factor: 1, minTimeout: 250, maxTimeout: 250 },
      rejectRateLimitedCalls: true,
    });
  });

  it('should let a caller with more budget override the defaults', async () => {
    await getSlackClient({ retryConfig: { retries: 0 }, timeout: 20_000 });

    expect(webClientMock).toHaveBeenCalledWith('xoxb-token', {
      timeout: 20_000,
      retryConfig: { retries: 0 },
      rejectRateLimitedCalls: true,
    });
  });

  it('should not build a client when Slack is not connected', async () => {
    getSlackConnectionMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected',
    });

    const result = await getSlackClient();

    expect(result).toEqual({ success: false, error: 'Slack is not connected' });
    expect(webClientMock).not.toHaveBeenCalled();
  });
});
