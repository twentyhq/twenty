import { type WebClient } from '@slack/web-api';
import { describe, expect, it, vi } from 'vitest';

import { fetchSlackConversationMessages } from 'src/logic-functions/utils/fetch-slack-conversation-messages';

const buildClient = ({
  replies,
  history,
}: {
  replies?: object[];
  history?: object[];
}): WebClient =>
  ({
    conversations: {
      replies: vi.fn().mockResolvedValue({ messages: replies ?? [] }),
      history: vi.fn().mockResolvedValue({ messages: history ?? [] }),
    },
  }) as unknown as WebClient;

describe('fetchSlackConversationMessages', () => {
  it('should map thread replies to user and assistant turns', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', user: 'U123', text: 'Find the ACME account' },
        { ts: '2', bot_id: 'B1', text: 'ACME is a company record.' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      isDirectMessage: false,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Find the ACME account' },
      { role: 'assistant', content: 'ACME is a company record.' },
    ]);
  });

  it('should exclude filtered timestamps and transient texts', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', user: 'U123', text: 'Hello' },
        { ts: '2', user: 'U123', text: 'The request itself' },
        { ts: '3', bot_id: 'B1', text: 'Thinking…' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      isDirectMessage: false,
      excludeMessageTimestamps: ['2'],
      excludeMessageTexts: ['Thinking…'],
    });

    expect(messages).toEqual([{ role: 'user', content: '<@U123>: Hello' }]);
  });

  it('should read channel history in chronological order for direct messages', async () => {
    const client = buildClient({
      history: [
        { ts: '2', bot_id: 'B1', text: 'Earlier answer' },
        { ts: '1', user: 'U123', text: 'Earlier question' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'D1',
      threadTimestamp: undefined,
      isDirectMessage: true,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Earlier question' },
      { role: 'assistant', content: 'Earlier answer' },
    ]);
  });

  it('should return undefined outside of threads and direct messages', async () => {
    const client = buildClient({});

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: undefined,
      isDirectMessage: false,
    });

    expect(messages).toBeUndefined();
  });

  it('should return undefined when the Slack API call fails', async () => {
    const client = {
      conversations: {
        replies: vi.fn().mockRejectedValue(new Error('slack down')),
      },
    } as unknown as WebClient;

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      isDirectMessage: false,
    });

    expect(messages).toBeUndefined();
  });
});
