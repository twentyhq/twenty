import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isSlackDirectMessageChannel } from 'src/logic-functions/utils/is-slack-direct-message-channel';

const conversationsInfoMock = vi.fn();

const client = {
  conversations: { info: conversationsInfoMock },
} as unknown as WebClient;

const SLACK_CHANNEL_ID = 'D0123456789';

describe('isSlackDirectMessageChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report a direct message when Slack says so', async () => {
    conversationsInfoMock.mockResolvedValue({ channel: { is_im: true } });

    expect(
      await isSlackDirectMessageChannel({
        client,
        slackChannelId: SLACK_CHANNEL_ID,
      }),
    ).toBe(true);
  });

  it('should not report a direct message for an ordinary channel', async () => {
    conversationsInfoMock.mockResolvedValue({ channel: { is_im: false } });

    expect(
      await isSlackDirectMessageChannel({
        client,
        slackChannelId: 'C0123456789',
      }),
    ).toBe(false);
  });

  it('should not report a direct message when Slack cannot be asked', async () => {
    conversationsInfoMock.mockRejectedValue(new Error('missing_scope'));

    expect(
      await isSlackDirectMessageChannel({
        client,
        slackChannelId: SLACK_CHANNEL_ID,
      }),
    ).toBe(false);
  });
});
