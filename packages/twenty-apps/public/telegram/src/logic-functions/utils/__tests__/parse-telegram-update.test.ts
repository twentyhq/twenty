import { describe, expect, it } from 'vitest';

import { parseTelegramUpdate } from 'src/logic-functions/utils/parse-telegram-update';

const USER = { id: 42, first_name: 'Ada' };
const PRIVATE_CHAT = { id: 42, type: 'private' };

const parseText = (text: string | undefined) =>
  parseTelegramUpdate({
    message: { message_id: 1, chat: PRIVATE_CHAT, from: USER, text },
  });

describe('parseTelegramUpdate', () => {
  it('reads the token of a connection link', () => {
    expect(parseText('/start AbC_123-xyz')).toEqual({
      kind: 'LINK_START',
      chatId: 42,
      user: USER,
      token: 'AbC_123-xyz',
    });
  });

  it.each(['/disconnect', '/disconnect@TwentyBot', ' /disconnect now'])(
    'reads %j as a disconnect request',
    (text) => {
      expect(parseText(text)).toEqual({
        kind: 'DISCONNECT',
        chatId: 42,
        user: USER,
      });
    },
  );

  it.each(['/start', 'hello', '/start two words', '/disconnected', undefined])(
    'reads %j as a plain message',
    (text) => {
      expect(parseText(text)).toEqual({
        kind: 'MESSAGE',
        chatId: 42,
        user: USER,
        messageId: 1,
        text: text ?? '',
      });
    },
  );

  it('reads a thumbs up or down tapped under an answer', () => {
    expect(
      parseTelegramUpdate({
        callback_query: {
          id: 'callback-1',
          from: USER,
          data: 'feedback:NEGATIVE:8f4e2c1a-0b7d-4c3e-9a51-6d2f8b0c7e14',
        },
      }),
    ).toEqual({
      kind: 'FEEDBACK',
      user: USER,
      callbackQueryId: 'callback-1',
      requestId: '8f4e2c1a-0b7d-4c3e-9a51-6d2f8b0c7e14',
      feedback: 'NEGATIVE',
    });
  });

  it.each(['feedback:MAYBE:request-1', 'other:POSITIVE:request-1', undefined])(
    'ignores a button tap carrying %j',
    (data) => {
      expect(
        parseTelegramUpdate({
          callback_query: { id: 'callback-1', from: USER, data },
        }),
      ).toBeUndefined();
    },
  );

  it('reads the largest size of a photo and its caption', () => {
    expect(
      parseTelegramUpdate({
        message: {
          message_id: 7,
          chat: PRIVATE_CHAT,
          from: USER,
          caption: ' Who is this? ',
          photo: [
            { file_id: 'small', file_size: 1000 },
            { file_id: 'large', file_size: 90_000 },
          ],
        },
      }),
    ).toEqual({
      kind: 'MESSAGE',
      chatId: 42,
      user: USER,
      messageId: 7,
      text: 'Who is this?',
      attachment: {
        telegramFileId: 'large',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 90_000,
      },
    });
  });

  it('reads a document sent without a caption', () => {
    expect(
      parseTelegramUpdate({
        message: {
          message_id: 8,
          chat: PRIVATE_CHAT,
          from: USER,
          document: {
            file_id: 'doc-1',
            file_name: 'invoice.pdf',
            mime_type: 'application/pdf',
            file_size: 20_000,
          },
        },
      }),
    ).toMatchObject({
      text: '',
      attachment: {
        telegramFileId: 'doc-1',
        fileName: 'invoice.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 20_000,
      },
    });
  });

  it('reads a user blocking the bot', () => {
    expect(
      parseTelegramUpdate({
        my_chat_member: {
          chat: PRIVATE_CHAT,
          from: USER,
          new_chat_member: { status: 'kicked' },
        },
      }),
    ).toEqual({ kind: 'BLOCKED', user: USER });
  });

  it('ignores messages outside a direct chat', () => {
    expect(
      parseTelegramUpdate({
        message: {
          message_id: 1,
          chat: { id: -100, type: 'supergroup' },
          from: USER,
          text: '/start token',
        },
      }),
    ).toBeUndefined();
  });

  it('ignores messages from another bot', () => {
    expect(
      parseTelegramUpdate({
        message: {
          message_id: 1,
          chat: PRIVATE_CHAT,
          from: { id: 7, is_bot: true },
          text: 'hello',
        },
      }),
    ).toBeUndefined();
  });
});
