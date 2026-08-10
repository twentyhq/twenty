import { type WebClient } from '@slack/web-api';
import { describe, expect, it, vi } from 'vitest';

import { fetchSlackConversationMessages } from 'src/logic-functions/utils/fetch-slack-conversation-messages';

const ASSISTANT_BOT_USER_ID = 'U_ASSISTANT';

const buildClient = ({ replies }: { replies?: object[] }): WebClient =>
  ({
    conversations: {
      replies: vi.fn().mockResolvedValue({ messages: replies ?? [] }),
    },
  }) as unknown as WebClient;

describe('fetchSlackConversationMessages', () => {
  it('should map member messages and own bot replies to user and assistant turns', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', user: 'U123', text: 'Find the ACME account' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'ACME is a company record.',
        },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
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
        { ts: '2', user: ASSISTANT_BOT_USER_ID, bot_id: 'B1', text: 'Noted.' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: 'bot B_OTHER: Deploy finished.' },
      { role: 'assistant', content: 'Noted.' },
    ]);
  });

  it('should not produce assistant turns when the bot user id is unknown', async () => {
    const client = buildClient({
      replies: [
        {
          ts: '1',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Earlier answer',
        },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: undefined,
    });

    expect(messages).toEqual([
      { role: 'user', content: 'bot B1: Earlier answer' },
    ]);
  });

  it('should exclude the triggering message by timestamp', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', user: 'U123', text: 'Hello' },
        { ts: '2', user: 'U123', text: 'The request itself' },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
      excludeMessageTimestamps: ['2'],
    });

    expect(messages).toEqual([{ role: 'user', content: '<@U123>: Hello' }]);
  });

  it('should drop leading assistant turns so the history opens on a user turn', async () => {
    const client = buildClient({
      replies: [
        {
          ts: '1',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Answer to a trimmed question',
        },
        { ts: '2', user: 'U123', text: 'Follow-up question' },
        {
          ts: '3',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Follow-up answer',
        },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Follow-up question' },
      { role: 'assistant', content: 'Follow-up answer' },
    ]);
  });

  it('should return no history when every remaining turn is an assistant turn', async () => {
    const client = buildClient({
      replies: [
        {
          ts: '1',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Only answer',
        },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([]);
  });

  it('should strip the answered-in footer from replayed assistant turns', async () => {
    const client = buildClient({
      replies: [
        { ts: '1', user: 'U123', text: 'Who owns ACME?' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Sarah owns it.\n\n_Answered in 4s_',
        },
      ],
    });

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages[1]).toEqual({
      role: 'assistant',
      content: 'Sarah owns it.',
    });
  });

  it('should page to the thread tail so long threads keep their most recent turns', async () => {
    const repliesMock = vi
      .fn()
      .mockResolvedValueOnce({
        messages: [{ ts: '1', user: 'U123', text: 'Oldest turn' }],
        response_metadata: { next_cursor: 'page2' },
      })
      .mockResolvedValueOnce({
        messages: [{ ts: '2', user: 'U123', text: 'Newest turn' }],
        response_metadata: { next_cursor: '' },
      });

    const client = {
      conversations: { replies: repliesMock },
    } as unknown as WebClient;

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(repliesMock).toHaveBeenCalledTimes(2);
    expect(repliesMock.mock.calls[1][0]).toMatchObject({ cursor: 'page2' });
    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Oldest turn' },
      { role: 'user', content: '<@U123>: Newest turn' },
    ]);
  });

  it('should warn and return no history when the thread tail is out of pagination reach', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const repliesMock = vi.fn().mockResolvedValue({
      messages: [{ ts: '1', user: 'U123', text: 'A turn from the thread head' }],
      response_metadata: { next_cursor: 'always-more' },
    });

    const client = {
      conversations: { replies: repliesMock },
    } as unknown as WebClient;

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('skipping history'),
    );

    warnSpy.mockRestore();
  });

  it('should return no history when the Slack API throws', async () => {
    const client = {
      conversations: {
        replies: vi.fn().mockRejectedValue(new Error('slack down')),
      },
    } as unknown as WebClient;

    const messages = await fetchSlackConversationMessages({
      client,
      channelId: 'C1',
      threadTimestamp: '1',
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([]);
  });
});
