import { describe, expect, it } from 'vitest';

import { buildSlackConversationMessages } from 'src/logic-functions/utils/build-slack-conversation-messages';

const ASSISTANT_BOT_USER_ID = 'U_ASSISTANT';

describe('buildSlackConversationMessages', () => {
  it('should keep only what members posted after the assistant last replied', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Find the ACME account' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'ACME is a company record.',
        },
        { ts: '3', user: 'U456', text: 'Who owns it?' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U456>: Who owns it?' },
    ]);
  });

  it('should carry the whole thread as user turns when the assistant has not replied yet', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Find the ACME account' },
        { ts: '2', user: 'U456', text: 'They moved to London' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Find the ACME account' },
      { role: 'user', content: '<@U456>: They moved to London' },
    ]);
  });

  it('should keep other bots as attributed user content', () => {
    const messages = buildSlackConversationMessages({
      messages: [{ ts: '1', bot_id: 'B_OTHER', text: 'Deploy finished.' }],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([
      { role: 'user', content: 'bot B_OTHER: Deploy finished.' },
    ]);
  });

  it('should return no history when the assistant reply is the latest message', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Who owns ACME?' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Sarah owns it.',
        },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
    });

    expect(messages).toEqual([]);
  });

  it('should leave the history to the stored thread when the bot user id is unknown', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Who owns ACME?' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Sarah owns it.',
        },
        { ts: '3', user: 'U456', text: 'Since when?' },
      ],
      assistantBotUserId: undefined,
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
});
