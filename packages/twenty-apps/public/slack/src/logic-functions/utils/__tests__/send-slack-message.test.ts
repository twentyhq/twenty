import { ErrorCode } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendSlackMessage } from 'src/logic-functions/utils/send-slack-message';

const { getSlackClientMock, postMessageMock } = vi.hoisted(() => ({
  getSlackClientMock: vi.fn(),
  postMessageMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

const CHANNEL_ID = 'C0123456789';

const RATE_LIMITED_ERROR = Object.assign(
  new Error('A rate limit was exceeded'),
  { code: ErrorCode.RateLimitedError, retryAfter: 9 },
);

describe('sendSlackMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { chat: { postMessage: postMessageMock } },
    });
  });

  it('should surface the Retry-After without waiting when asked not to wait out a rate limit', async () => {
    postMessageMock.mockRejectedValue(RATE_LIMITED_ERROR);

    const result = await sendSlackMessage(
      { slackChannelId: CHANNEL_ID, messageText: 'hello' },
      { waitOutRateLimit: false },
    );

    expect(postMessageMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: 'Failed to post Slack message',
      error: 'A rate limit was exceeded',
      retryAfterSeconds: 9,
    });
  });

  it('should return the connection error without posting when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    const result = await sendSlackMessage({
      slackChannelId: CHANNEL_ID,
      messageText: 'hello',
    });

    expect(result).toEqual({
      success: false,
      message: 'Slack is not connected',
      error: 'Slack is not connected.',
    });
    expect(postMessageMock).not.toHaveBeenCalled();
  });
});
