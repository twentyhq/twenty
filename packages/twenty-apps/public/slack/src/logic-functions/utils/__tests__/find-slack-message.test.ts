import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findSlackMessage } from 'src/logic-functions/utils/find-slack-message';

const repliesMock = vi.fn();

const client = {
  conversations: { replies: repliesMock },
} as unknown as WebClient;

const CHANNEL_ID = 'C0123456789';
const PARENT_TS = '1700000000.000100';
const MESSAGE_TS = '1700000000.000200';
const SLACK_USER_ID = 'U0123456789';

const find = (parentMessageTimestamp = PARENT_TS) =>
  findSlackMessage({
    client,
    slackChannelId: CHANNEL_ID,
    parentMessageTimestamp,
    messageTimestamp: MESSAGE_TS,
  });

describe('findSlackMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repliesMock.mockResolvedValue({
      messages: [
        { ts: PARENT_TS, user: 'U0SOMEONEELSE', text: 'the parent' },
        { ts: MESSAGE_TS, user: SLACK_USER_ID, text: 'who owns ACME?' },
      ],
    });
  });

  it('should return the author and text of the referenced message', async () => {
    expect(await find()).toEqual({
      user: SLACK_USER_ID,
      text: 'who owns ACME?',
    });
  });

  it('should return the message when it is its own parent', async () => {
    repliesMock.mockResolvedValue({
      messages: [{ ts: MESSAGE_TS, user: SLACK_USER_ID, text: 'hello' }],
    });

    expect(await find(MESSAGE_TS)).toEqual({
      user: SLACK_USER_ID,
      text: 'hello',
    });
  });

  it('should return undefined when no message exists at that timestamp', async () => {
    repliesMock.mockResolvedValue({
      messages: [{ ts: PARENT_TS, user: SLACK_USER_ID, text: 'the parent' }],
    });

    expect(await find()).toBeUndefined();
  });

  it('should follow pagination before giving up', async () => {
    repliesMock
      .mockResolvedValueOnce({
        messages: [{ ts: PARENT_TS, user: SLACK_USER_ID, text: 'the parent' }],
        response_metadata: { next_cursor: 'cursor-1' },
      })
      .mockResolvedValueOnce({
        messages: [{ ts: MESSAGE_TS, user: SLACK_USER_ID, text: 'later' }],
      });

    expect(await find()).toEqual({ user: SLACK_USER_ID, text: 'later' });
    expect(repliesMock).toHaveBeenCalledTimes(2);
  });

  it('should return undefined when Slack cannot be reached', async () => {
    repliesMock.mockRejectedValue(new Error('channel_not_found'));

    expect(await find()).toBeUndefined();
  });
});
