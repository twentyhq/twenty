import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';

const { getSlackClientMock, postMessageMock } = vi.hoisted(() => ({
  getSlackClientMock: vi.fn(),
  postMessageMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

const CHANNEL_ID = 'C0123456789';

describe('slackPostMessageHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { chat: { postMessage: postMessageMock } },
    });
  });

  it('should return a failure result and skip posting when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    const result = await slackPostMessageHandler({
      slackChannelId: CHANNEL_ID,
      messageText: 'hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Slack is not connected.');
    expect(postMessageMock).not.toHaveBeenCalled();
  });

  it('should post the message and return the Slack timestamp and channel', async () => {
    postMessageMock.mockResolvedValue({
      ts: '1700000000.000100',
      channel: CHANNEL_ID,
    });

    const result = await slackPostMessageHandler({
      slackChannelId: CHANNEL_ID,
      messageText: 'hello',
      messageFormat: 'markdown',
    });

    expect(postMessageMock).toHaveBeenCalledWith({
      channel: CHANNEL_ID,
      thread_ts: undefined,
      markdown_text: 'hello',
    });
    expect(result).toEqual({
      success: true,
      message: 'Message posted to Slack (ts=1700000000.000100).',
      slackTs: '1700000000.000100',
      channel: CHANNEL_ID,
    });
  });

  it('should reply inside a thread with a trimmed parent timestamp', async () => {
    postMessageMock.mockResolvedValue({
      ts: '1700000000.000200',
      channel: CHANNEL_ID,
    });

    await slackPostMessageHandler({
      slackChannelId: CHANNEL_ID,
      messageText: 'in thread',
      parentMessageTimestamp: '  1699999999.000100  ',
    });

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ thread_ts: '1699999999.000100' }),
    );
  });

  it('should not set thread_ts when the parent timestamp is blank', async () => {
    postMessageMock.mockResolvedValue({ ts: '1700000000.000300' });

    await slackPostMessageHandler({
      slackChannelId: CHANNEL_ID,
      messageText: 'standalone',
      parentMessageTimestamp: '   ',
    });

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ thread_ts: undefined }),
    );
  });

  it('should return a failure result when the Slack API throws', async () => {
    postMessageMock.mockRejectedValue(new Error('channel_not_found'));

    const result = await slackPostMessageHandler({
      slackChannelId: CHANNEL_ID,
      messageText: 'hello',
    });

    expect(result).toEqual({
      success: false,
      message: 'Failed to post Slack message',
      error: 'channel_not_found',
    });
  });
});
