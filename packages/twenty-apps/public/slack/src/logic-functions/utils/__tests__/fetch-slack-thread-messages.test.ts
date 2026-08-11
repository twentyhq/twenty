import { type WebClient } from '@slack/web-api';
import { describe, expect, it, vi } from 'vitest';

import { fetchSlackThreadMessages } from 'src/logic-functions/utils/fetch-slack-thread-messages';

const buildMessage = (index: number) => ({
  ts: `1700000000.${String(index).padStart(6, '0')}`,
  user: 'U123',
  text: `message ${index}`,
});

const buildClient = (
  pages: Array<{ messages: object[]; nextCursor?: string }>,
): { client: WebClient; repliesMock: ReturnType<typeof vi.fn> } => {
  const repliesMock = vi.fn();

  pages.forEach((page) =>
    repliesMock.mockResolvedValueOnce({
      messages: page.messages,
      response_metadata: { next_cursor: page.nextCursor ?? '' },
    }),
  );

  return {
    client: { conversations: { replies: repliesMock } } as unknown as WebClient,
    repliesMock,
  };
};

const fetchThread = (client: WebClient) =>
  fetchSlackThreadMessages({
    client,
    slackChannelId: 'C123',
    parentMessageTimestamp: '1700000000.000001',
  });

describe('fetchSlackThreadMessages', () => {
  it('should return the messages of a single page', async () => {
    const { client } = buildClient([
      { messages: [buildMessage(1), buildMessage(2)] },
    ]);

    expect(await fetchThread(client)).toEqual([
      buildMessage(1),
      buildMessage(2),
    ]);
  });

  it('should follow pagination and concatenate every page', async () => {
    const { client, repliesMock } = buildClient([
      { messages: [buildMessage(1)], nextCursor: 'cursor-page-2' },
      { messages: [buildMessage(2)] },
    ]);

    expect(await fetchThread(client)).toEqual([
      buildMessage(1),
      buildMessage(2),
    ]);
    expect(repliesMock).toHaveBeenCalledTimes(2);
    expect(repliesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-page-2' }),
    );
  });

  // Slack pages a thread oldest first, so the messages read before the cap are
  // the stale ones. Returning them would present them as the recent turns.
  it('should stop at the page cap and report the thread as unreadable', async () => {
    const repliesMock = vi.fn().mockResolvedValue({
      messages: [buildMessage(1)],
      response_metadata: { next_cursor: 'cursor-next' },
    });
    const client = {
      conversations: { replies: repliesMock },
    } as unknown as WebClient;

    expect(await fetchThread(client)).toBeUndefined();
    expect(repliesMock).toHaveBeenCalledTimes(10);
  });

  it('should return undefined when the Slack API throws', async () => {
    const repliesMock = vi.fn().mockRejectedValue(new Error('boom'));
    const client = {
      conversations: { replies: repliesMock },
    } as unknown as WebClient;

    expect(await fetchThread(client)).toBeUndefined();
  });
});
