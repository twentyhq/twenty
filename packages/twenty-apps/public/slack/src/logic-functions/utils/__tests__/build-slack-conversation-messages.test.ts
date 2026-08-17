import { describe, expect, it } from 'vitest';

import { buildSlackConversationMessages } from 'src/logic-functions/utils/build-slack-conversation-messages';

const ASSISTANT_BOT_USER_ID = 'U_ASSISTANT';

describe('buildSlackConversationMessages', () => {
  it('should map member messages and own bot replies to user and assistant turns', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Find the ACME account' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'ACME is a company record.',
        },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Find the ACME account' },
      { role: 'assistant', content: 'ACME is a company record.' },
    ]);
  });

  it('should keep other bots as attributed user content instead of assistant turns', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', bot_id: 'B_OTHER', text: 'Deploy finished.' },
        { ts: '2', user: ASSISTANT_BOT_USER_ID, bot_id: 'B1', text: 'Noted.' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: 'bot B_OTHER: Deploy finished.' },
      { role: 'assistant', content: 'Noted.' },
    ]);
  });

  it('should not produce assistant turns when the bot user id is unknown', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        {
          ts: '1',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Earlier answer',
        },
      ],
      assistantBotUserId: undefined,
    });

    expect(messages).toEqual([
      { role: 'user', content: 'bot B1: Earlier answer' },
    ]);
  });

  it('should exclude the triggering message by timestamp', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Hello' },
        { ts: '2', user: 'U123', text: 'The request itself' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
      excludeMessageTimestamps: ['2'],
    });

    expect(messages).toEqual([{ role: 'user', content: '<@U123>: Hello' }]);
  });

  it('should drop leading assistant turns so the history opens on a user turn', () => {
    const messages = buildSlackConversationMessages({
      messages: [
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
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Follow-up question' },
      { role: 'assistant', content: 'Follow-up answer' },
    ]);
  });

  it('should return no history when every remaining turn is an assistant turn', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        {
          ts: '1',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Only answer',
        },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([]);
  });

  it('should strip the answered-in footer from replayed assistant turns', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Who owns ACME?' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Sarah owns it.\n\n_Answered in 4s_',
        },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages[1]).toEqual({
      role: 'assistant',
      content: 'Sarah owns it.',
    });
  });
});
