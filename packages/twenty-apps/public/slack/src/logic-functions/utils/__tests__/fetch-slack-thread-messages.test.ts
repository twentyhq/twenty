import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchSlackThreadMessages } from 'src/logic-functions/utils/fetch-slack-thread-messages';

const PARENT_TS = '1700000000.000100';
const REQUEST_TS = '1700000000.000200';
const SLACK_USER_ID = 'U0123456789';

const repliesMock = vi.fn();

const client = {
  conversations: { replies: repliesMock },
} as unknown as WebClient;

const fetchThread = (parentMessageTimestamp = PARENT_TS) =>
  fetchSlackThreadMessages({
    client,
    slackChannelId: 'C0123456789',
    parentMessageTimestamp,
    requestMessageTimestamp: REQUEST_TS,
  });

describe('fetchSlackThreadMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repliesMock.mockResolvedValue({
      messages: [
        { ts: PARENT_TS, user: 'U0SOMEONEELSE', text: 'the parent' },
        { ts: REQUEST_TS, user: SLACK_USER_ID, text: 'who owns ACME?' },
      ],
    });
  });

  it('should return the thread tail and the message the request came from', async () => {
    const { tailMessages, requestMessage } = await fetchThread();

    expect(tailMessages).toHaveLength(2);
    expect(requestMessage).toEqual({
      ts: REQUEST_TS,
      user: SLACK_USER_ID,
      text: 'who owns ACME?',
    });
  });

  it('should find a top-level message that is its own parent', async () => {
    repliesMock.mockResolvedValue({
      messages: [{ ts: REQUEST_TS, user: SLACK_USER_ID, text: 'hello' }],
    });

    const { requestMessage } = await fetchThread(REQUEST_TS);

    expect(requestMessage).toEqual({
      ts: REQUEST_TS,
      user: SLACK_USER_ID,
      text: 'hello',
    });
  });

  it('should leave the request message undefined when the thread has no message at that timestamp', async () => {
    repliesMock.mockResolvedValue({
      messages: [{ ts: PARENT_TS, user: SLACK_USER_ID, text: 'the parent' }],
    });

    expect((await fetchThread()).requestMessage).toBeUndefined();
  });

  it('should read the whole thread in one pass across pages', async () => {
    repliesMock
      .mockResolvedValueOnce({
        messages: [{ ts: PARENT_TS, user: SLACK_USER_ID, text: 'the parent' }],
        response_metadata: { next_cursor: 'cursor-1' },
      })
      .mockResolvedValueOnce({
        messages: [{ ts: REQUEST_TS, user: SLACK_USER_ID, text: 'later' }],
      });

    const { tailMessages, requestMessage } = await fetchThread();

    expect(repliesMock).toHaveBeenCalledTimes(2);
    expect(repliesMock.mock.calls[1][0]).toMatchObject({ cursor: 'cursor-1' });
    expect(tailMessages).toHaveLength(2);
    expect(requestMessage?.text).toBe('later');
  });

  it('should warn and drop the history when the thread tail is out of pagination reach', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    repliesMock.mockResolvedValue({
      messages: [
        { ts: '1', user: SLACK_USER_ID, text: 'a turn from the head' },
      ],
      response_metadata: { next_cursor: 'always-more' },
    });

    const { tailMessages, requestMessage } = await fetchThread();

    expect(tailMessages).toEqual([]);
    expect(requestMessage).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('skipping history'),
    );

    warnSpy.mockRestore();
  });

  it('should return nothing when Slack cannot be reached', async () => {
    repliesMock.mockRejectedValue(new Error('channel_not_found'));

    expect(await fetchThread()).toEqual({
      tailMessages: [],
      requestMessage: undefined,
    });
  });
});
