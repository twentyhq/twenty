import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isSlackMessageAuthoredBy } from 'src/logic-functions/utils/is-slack-message-authored-by';

const repliesMock = vi.fn();

const client = {
  conversations: { replies: repliesMock },
} as unknown as WebClient;

const CHANNEL_ID = 'C0123456789';
const PARENT_TS = '1700000000.000100';
const MESSAGE_TS = '1700000000.000200';
const SLACK_USER_ID = 'U0123456789';

const check = (slackUserId = SLACK_USER_ID) =>
  isSlackMessageAuthoredBy({
    client,
    slackChannelId: CHANNEL_ID,
    parentMessageTimestamp: PARENT_TS,
    messageTimestamp: MESSAGE_TS,
    slackUserId,
  });

describe('isSlackMessageAuthoredBy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repliesMock.mockResolvedValue({
      messages: [
        { ts: PARENT_TS, user: 'U0SOMEONEELSE' },
        { ts: MESSAGE_TS, user: SLACK_USER_ID },
      ],
    });
  });

  it('should confirm the named user posted the message', async () => {
    expect(await check()).toBe(true);
  });

  it('should reject a request naming a different user than Slack records', async () => {
    expect(await check('U0IMPERSONATED')).toBe(false);
  });

  it('should reject when no message exists at that timestamp', async () => {
    repliesMock.mockResolvedValue({
      messages: [{ ts: PARENT_TS, user: SLACK_USER_ID }],
    });

    expect(await check()).toBe(false);
  });

  it('should confirm a top-level message that is its own parent', async () => {
    repliesMock.mockResolvedValue({
      messages: [{ ts: MESSAGE_TS, user: SLACK_USER_ID }],
    });

    expect(
      await isSlackMessageAuthoredBy({
        client,
        slackChannelId: CHANNEL_ID,
        parentMessageTimestamp: MESSAGE_TS,
        messageTimestamp: MESSAGE_TS,
        slackUserId: SLACK_USER_ID,
      }),
    ).toBe(true);
  });

  it('should follow pagination before giving up', async () => {
    repliesMock
      .mockResolvedValueOnce({
        messages: [{ ts: PARENT_TS, user: SLACK_USER_ID }],
        response_metadata: { next_cursor: 'cursor-1' },
      })
      .mockResolvedValueOnce({
        messages: [{ ts: MESSAGE_TS, user: SLACK_USER_ID }],
      });

    expect(await check()).toBe(true);
    expect(repliesMock).toHaveBeenCalledTimes(2);
  });

  it('should reject when Slack cannot be reached', async () => {
    repliesMock.mockRejectedValue(new Error('channel_not_found'));

    expect(await check()).toBe(false);
  });
});
