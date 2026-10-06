import { describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { buildSlackConversationMessages } from 'src/logic-functions/utils/build-slack-conversation-messages';

const ASSISTANT_BOT_USER_ID = 'U_ASSISTANT';

describe('buildSlackConversationMessages', () => {
  it('should keep only the messages after the last answered request that the server has not seen', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Find the ACME account' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'ACME is a company record.',
        },
        { ts: '3', user: 'U456', text: 'They moved to London' },
        { ts: '4', user: 'U123', text: 'Update their address' },
        { ts: '5', user: 'U789', text: 'Thanks!' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
      requestStatusByMessageTimestamp: new Map([
        ['1', SLACK_ASSISTANT_REQUEST_STATUS.DONE],
        ['4', SLACK_ASSISTANT_REQUEST_STATUS.PENDING],
      ]),
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U456>: They moved to London' },
      { role: 'user', content: '<@U789>: Thanks!' },
    ]);
  });

  it('should keep a failed request so its question is not lost with its turn', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', user: 'U123', text: 'Who owns ACME?' },
        {
          ts: '2',
          user: ASSISTANT_BOT_USER_ID,
          bot_id: 'B1',
          text: 'Something went wrong.',
        },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
      requestStatusByMessageTimestamp: new Map([
        ['1', SLACK_ASSISTANT_REQUEST_STATUS.FAILED],
      ]),
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Who owns ACME?' },
    ]);
  });

  it('should carry the whole thread when nothing in it was answered yet', () => {
    const messages = buildSlackConversationMessages({
      messages: [
        { ts: '1', bot_id: 'B_OTHER', text: 'Deploy finished.' },
        { ts: '2', user: 'U456', text: 'Nice, ping ACME about it' },
      ],
      assistantBotUserId: ASSISTANT_BOT_USER_ID,
      requestStatusByMessageTimestamp: new Map(),
    });

    expect(messages).toEqual([
      { role: 'user', content: 'bot B_OTHER: Deploy finished.' },
      { role: 'user', content: '<@U456>: Nice, ping ACME about it' },
    ]);
  });

  it('should drop every bot message when the assistant user id is unknown', () => {
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
      requestStatusByMessageTimestamp: new Map(),
    });

    expect(messages).toEqual([
      { role: 'user', content: '<@U123>: Who owns ACME?' },
      { role: 'user', content: '<@U456>: Since when?' },
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
      requestStatusByMessageTimestamp: new Map(),
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
      requestStatusByMessageTimestamp: new Map(),
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
