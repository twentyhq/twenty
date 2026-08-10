import { describe, expect, it, vi } from 'vitest';
import { type WebClient } from '@slack/web-api';

import { fetchSlackConversationContext } from 'src/logic-functions/utils/fetch-slack-conversation-context';

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

describe('fetchSlackConversationContext', () => {
  it('should keep the most recent turns from a single page', async () => {
    const { client } = buildClient([
      { messages: [buildMessage(1), buildMessage(2)] },
    ]);

    const context = await fetchSlackConversationContext({
      client,
      channelId: 'C123',
      threadTimestamp: '1700000000.000001',
    });

    expect(context).toBe('<@U123>: message 1\n<@U123>: message 2');
  });

  it('should follow pagination so the latest turns of a long thread are kept', async () => {
    const olderMessages = Array.from({ length: 100 }, (_, index) =>
      buildMessage(index),
    );
    const latestMessages = Array.from({ length: 20 }, (_, index) =>
      buildMessage(100 + index),
    );
    const { client, repliesMock } = buildClient([
      { messages: olderMessages, nextCursor: 'cursor-page-2' },
      { messages: latestMessages },
    ]);

    const context = await fetchSlackConversationContext({
      client,
      channelId: 'C123',
      threadTimestamp: '1700000000.000001',
    });

    expect(repliesMock).toHaveBeenCalledTimes(2);
    expect(repliesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-page-2' }),
    );
    expect(context).toBe(
      Array.from(
        { length: 15 },
        (_, index) => `<@U123>: message ${105 + index}`,
      ).join('\n'),
    );
  });

  it('should exclude the triggering message by timestamp', async () => {
    const { client } = buildClient([
      { messages: [buildMessage(1), buildMessage(2)] },
    ]);

    const context = await fetchSlackConversationContext({
      client,
      channelId: 'C123',
      threadTimestamp: '1700000000.000001',
      excludeMessageTimestamps: ['1700000000.000002'],
    });

    expect(context).toBe('<@U123>: message 1');
  });

  it('should return undefined when the Slack API throws', async () => {
    const repliesMock = vi.fn().mockRejectedValue(new Error('boom'));
    const client = {
      conversations: { replies: repliesMock },
    } as unknown as WebClient;

    const context = await fetchSlackConversationContext({
      client,
      channelId: 'C123',
      threadTimestamp: '1700000000.000001',
    });

    expect(context).toBeUndefined();
  });
});
