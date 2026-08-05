import { type WebClient } from '@slack/web-api';
import { describe, expect, it, vi } from 'vitest';

import { fetchSlackConversationMessages } from 'src/logic-functions/utils/fetch-slack-conversation-messages';

const ASSISTANT_BOT_ID = 'B_ASSISTANT';

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
  it('should map member messages and own bot replies to user and assistant turns', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', user: 'U123', text: 'Find the ACME account' },
        { ts: '2', bot_id: ASSISTANT_BOT_ID, text: 'ACME is a company record.' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      isDirectMessage: false,
      assistantBotId: ASSISTANT_BOT_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Find the ACME account' },
      { role: 'assistant', content: 'ACME is a company record.' },
    ]);
  });

  it('should keep other bots as attributed user content instead of assistant turns', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', bot_id: 'B_OTHER', text: 'Deploy finished.' },
        { ts: '2', bot_id: ASSISTANT_BOT_ID, text: 'Noted.' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      isDirectMessage: false,
      assistantBotId: ASSISTANT_BOT_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: 'bot B_OTHER: Deploy finished.' },
      { role: 'assistant', content: 'Noted.' },
    ]);
  });

  it('should not produce assistant turns when the own bot id is unknown', async () => {
    const client = buildClient({
      replies: [{ ts: '1', bot_id: ASSISTANT_BOT_ID, text: 'Earlier answer' }],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      isDirectMessage: false,
      assistantBotId: undefined,
    });

    expect(messages).toEqual([
      { role: 'user', content: `bot ${ASSISTANT_BOT_ID}: Earlier answer` },
    ]);
  });

  it('should exclude filtered timestamps and transient texts', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', user: 'U123', text: 'Hello' },
        { ts: '2', user: 'U123', text: 'The request itself' },
        { ts: '3', bot_id: ASSISTANT_BOT_ID, text: 'Thinking…' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      isDirectMessage: false,
      assistantBotId: ASSISTANT_BOT_ID,
      excludeMessageTimestamps: ['2'],
      excludeMessageTexts: ['Thinking…'],
    });

    expect(messages).toEqual([{ role: 'user', content: '<@U123>: Hello' }]);
  });

  it('should read channel history in chronological order for direct messages', async () => {
    const client = buildClient({
      history: [
        { ts: '2', bot_id: ASSISTANT_BOT_ID, text: 'Earlier answer' },
        { ts: '1', user: 'U123', text: 'Earlier question' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'D1',
      threadTimestamp: undefined,
      isDirectMessage: true,
      assistantBotId: ASSISTANT_BOT_ID,
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
      assistantBotId: ASSISTANT_BOT_ID,
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
      assistantBotId: ASSISTANT_BOT_ID,
    });

    expect(messages).toBeUndefined();
  });
});
