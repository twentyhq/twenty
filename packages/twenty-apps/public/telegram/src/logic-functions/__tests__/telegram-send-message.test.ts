import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreClientFake } from 'src/__tests__/utils/create-core-client-fake';
import { createKvFake } from 'src/__tests__/utils/create-kv-fake';
import { stubTelegramApi } from 'src/__tests__/utils/stub-telegram-api';
import { TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-plain-message-max-length';
import { telegramSendMessageHandler } from 'src/logic-functions/telegram-send-message';

const { kvHolder, clientHolder } = vi.hoisted(() => {
  const kvHolder: { kv?: ReturnType<typeof createKvFake>['kv'] } = {};
  const clientHolder: {
    client?: ReturnType<typeof createCoreClientFake>['client'];
  } = {};

  return { kvHolder, clientHolder };
});

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  get kv() {
    return kvHolder.kv;
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return clientHolder.client;
  }),
}));

const BOT_TOKEN = 'bot-token';
const LINKS = [
  { id: 'link-1', telegramUserId: '42', workspaceMemberId: 'member-1' },
  { id: 'link-2', telegramUserId: '43', workspaceMemberId: 'member-2' },
];

describe('sending a Telegram message to a workspace member', () => {
  let kvFake: ReturnType<typeof createKvFake>;
  let coreFake: ReturnType<typeof createCoreClientFake>;

  beforeEach(async () => {
    kvFake = createKvFake();
    coreFake = createCoreClientFake({ links: LINKS });
    kvHolder.kv = kvFake.kv;
    clientHolder.client = coreFake.client;
    vi.stubEnv('TELEGRAM_BOT_TOKEN', BOT_TOKEN);
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'webhook-secret');

    await kvFake.kv.set('telegram-user:42', null, { scope: 'SERVER' });
    await kvFake.kv.set('telegram-user:43', null, { scope: 'SERVER' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends the text to the chat of the connected member', async () => {
    const calls = stubTelegramApi({
      results: { sendMessage: { message_id: 7 } },
    });

    await expect(
      telegramSendMessageHandler({
        workspaceMemberId: 'member-2',
        text: 'Deal won',
      }),
    ).resolves.toEqual({ success: true, messageId: 7 });
    expect(calls).toEqual([
      { method: 'sendMessage', params: { chat_id: 43, text: 'Deal won' } },
    ]);
  });

  it('reports a member who has not connected a Telegram account', async () => {
    const calls = stubTelegramApi();

    await expect(
      telegramSendMessageHandler({
        workspaceMemberId: 'member-3',
        text: 'Deal won',
      }),
    ).resolves.toEqual({
      success: false,
      error:
        'This workspace member has not connected a Telegram account to Twenty.',
    });
    expect(calls).toEqual([]);
  });

  it('refuses a missing workspace member id', async () => {
    const calls = stubTelegramApi();

    await expect(
      telegramSendMessageHandler({ text: 'Deal won' }),
    ).resolves.toEqual({
      success: false,
      error: 'workspaceMemberId is required.',
    });
    expect(calls).toEqual([]);
  });

  it.each([
    { label: 'a missing text', text: undefined },
    { label: 'a blank text', text: '  ' },
    { label: 'a text that is not a string', text: 42 },
  ])('refuses $label', async ({ text }) => {
    const calls = stubTelegramApi();

    await expect(
      telegramSendMessageHandler({ workspaceMemberId: 'member-1', text }),
    ).resolves.toEqual({
      success: false,
      error: 'text is required and cannot be empty.',
    });
    expect(calls).toEqual([]);
  });

  it('refuses a text over the Telegram limit', async () => {
    const calls = stubTelegramApi();

    await expect(
      telegramSendMessageHandler({
        workspaceMemberId: 'member-1',
        text: 'a'.repeat(TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH + 1),
      }),
    ).resolves.toEqual({
      success: false,
      error: `text is too long: Telegram accepts at most ${TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH} characters, got ${TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH + 1}.`,
    });
    expect(calls).toEqual([]);
  });

  it('accepts a text exactly at the Telegram limit', async () => {
    stubTelegramApi({ results: { sendMessage: { message_id: 8 } } });

    await expect(
      telegramSendMessageHandler({
        workspaceMemberId: 'member-1',
        text: 'a'.repeat(TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH),
      }),
    ).resolves.toEqual({ success: true, messageId: 8 });
  });

  it('reports a bot that is not configured without calling Telegram', async () => {
    const calls = stubTelegramApi();

    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');

    await expect(
      telegramSendMessageHandler({
        workspaceMemberId: 'member-1',
        text: 'Deal won',
      }),
    ).resolves.toEqual({
      success: false,
      error:
        'The Telegram bot is not configured: TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET must be set on the server.',
    });
    expect(calls).toEqual([]);
  });

  it('disconnects a member who blocked the bot and reports it', async () => {
    stubTelegramApi({
      failures: {
        sendMessage: [
          {
            error_code: 403,
            description: 'Forbidden: bot was blocked by the user',
          },
        ],
      },
    });

    await expect(
      telegramSendMessageHandler({
        workspaceMemberId: 'member-1',
        text: 'Deal won',
      }),
    ).resolves.toEqual({
      success: false,
      error:
        'This workspace member blocked the Telegram bot. Their Telegram account was disconnected from Twenty.',
    });
    expect(coreFake.state.links).toEqual([LINKS[1]]);
    expect([...kvFake.serverClaims.keys()]).toEqual(['telegram-user:43']);
  });

  it('reports a Telegram error without the bot token and keeps the connection', async () => {
    stubTelegramApi({
      failures: {
        sendMessage: [
          { error_code: 400, description: 'Bad Request: chat not found' },
        ],
      },
    });

    const result = await telegramSendMessageHandler({
      workspaceMemberId: 'member-1',
      text: 'Deal won',
    });

    expect(result).toEqual({
      success: false,
      error: 'Telegram sendMessage failed: Bad Request: chat not found',
    });
    expect(JSON.stringify(result)).not.toContain(BOT_TOKEN);
    expect(coreFake.state.links).toEqual(LINKS);
  });
});
