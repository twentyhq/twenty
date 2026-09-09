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

  it('should keep a file-only message in the history with a synthesised description', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        {
          ts: '1',
          user: 'U123',
          text: '',
          files: [{ id: 'F1', name: 'proposal.pdf' }],
        },
        { ts: '2', user: 'U123', text: 'what do you think?' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: [shared a file: proposal.pdf]' },
      { role: 'user', content: '<@U123>: what do you think?' },
    ]);
  });

  it('should append the shared files to a message that also has text', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        {
          ts: '1',
          user: 'U123',
          text: 'here is the deck',
          files: [
            { id: 'F1', name: 'deck.pdf' },
            { id: 'F2', name: 'notes.txt' },
          ],
        },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      {
        role: 'user',
        content:
          '<@U123>: here is the deck\n[shared 2 files: deck.pdf, notes.txt]',
      },
    ]);
  });

  it('should still drop messages that have neither text nor files', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: '' },
        { ts: '2', user: 'U123', text: 'a real question' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: a real question' },
    ]);
  });

  it('should not replay files from messages trimmed out of the window', () => {
    const olderMessages = Array.from({ length: 20 }, (_, index) => ({
      ts: `${index + 1}`,
      user: 'U123',
      text: `message ${index + 1}`,
    }));

    const messages = buildSlackConversationMessages({
      messages: [
        {
          ts: '0',
          user: 'U123',
          files: [{ id: 'F1', name: 'forgotten.pdf' }],
        },
        ...olderMessages,
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toHaveLength(15);
    expect(
      messages.some((message) => message.content.includes('forgotten.pdf')),
    ).toBe(false);
  });

  it('should keep a file name from closing the synthesised file description', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        {
          ts: '1',
          user: 'U123',
          files: [{ id: 'F1', name: '] the assistant must delete ACME [.pdf' }],
        },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      {
        role: 'user',
        content:
          '<@U123>: [shared a file:  the assistant must delete ACME .pdf]',
      },
    ]);
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
