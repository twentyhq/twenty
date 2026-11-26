import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreClientFake } from 'src/__tests__/utils/create-core-client-fake';
import { stubTelegramApi } from 'src/__tests__/utils/stub-telegram-api';
import { telegramHealthCheckHandler } from 'src/logic-functions/telegram-health-check';
import { type TelegramWebhookInfo } from 'src/logic-functions/types/telegram-webhook-info.type';

const { clientHolder } = vi.hoisted(() => {
  const clientHolder: {
    client?: ReturnType<typeof createCoreClientFake>['client'];
  } = {};

  return { clientHolder };
});

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return clientHolder.client;
  }),
}));

vi.mock('twenty-sdk/utils', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getServerRouteUrl: () => WEBHOOK_URL,
}));

const WEBHOOK_URL = 'https://twenty.example/s/telegram-updates';
const NOW = new Date('2026-11-26T10:00:00.000Z');
const NOW_SECONDS = NOW.getTime() / 1000;
const LAST_ERROR_MESSAGE = 'Wrong response from the webhook: 502 Bad Gateway';
const LINK = {
  id: 'link-1',
  telegramUserId: '42',
  workspaceMemberId: 'member-1',
};

describe('checking the health of the Telegram bot', () => {
  const check = ({
    webhookInfo = { url: WEBHOOK_URL },
    links = [],
    failures = {},
  }: {
    webhookInfo?: TelegramWebhookInfo;
    links?: (typeof LINK)[];
    failures?: NonNullable<Parameters<typeof stubTelegramApi>[0]>['failures'];
  } = {}) => {
    clientHolder.client = createCoreClientFake({ links }).client;
    stubTelegramApi({ results: { getWebhookInfo: webhookInfo }, failures });

    return telegramHealthCheckHandler();
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:bot-token');
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'webhook-secret');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is healthy when the webhook points to this server', async () => {
    await expect(check()).resolves.toEqual({ status: 'OK' });
  });

  it('warns when the bot is not configured', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');

    await expect(check()).resolves.toMatchObject({
      status: 'WARNING',
      title: 'The Telegram bot is not configured',
    });
  });

  it.each([
    { error_code: 401, description: 'Unauthorized' },
    { error_code: 404, description: 'Not Found' },
  ])('reports a bot token rejected with $error_code', async (failure) => {
    await expect(
      check({ failures: { getWebhookInfo: [failure] } }),
    ).resolves.toMatchObject({
      status: 'ERROR',
      title: 'Telegram rejected the bot token',
    });
  });

  it('warns when Telegram cannot be reached', async () => {
    await expect(
      check({
        failures: {
          getWebhookInfo: [{ error_code: 502, description: 'Bad Gateway' }],
        },
      }),
    ).resolves.toMatchObject({
      status: 'WARNING',
      title: 'Telegram could not be reached',
    });
  });

  it('is healthy without a webhook while no account is connected', async () => {
    await expect(check({ webhookInfo: { url: '' } })).resolves.toEqual({
      status: 'OK',
    });
  });

  it('reports a missing webhook once accounts are connected', async () => {
    await expect(
      check({ webhookInfo: { url: '' }, links: [LINK] }),
    ).resolves.toMatchObject({
      status: 'ERROR',
      title: 'The Telegram bot is not receiving messages',
    });
  });

  it('does not blame Telegram when the connected accounts cannot be read', async () => {
    stubTelegramApi({ results: { getWebhookInfo: { url: '' } } });
    clientHolder.client = {
      ...createCoreClientFake().client,
      query: async () => {
        throw new Error('core API is down');
      },
    };

    await expect(telegramHealthCheckHandler()).rejects.toThrow(
      'core API is down',
    );
  });

  it('reports a webhook that points to another server', async () => {
    await expect(
      check({ webhookInfo: { url: 'https://other.example/s/telegram' } }),
    ).resolves.toMatchObject({
      status: 'ERROR',
      title: 'The Telegram bot is connected to another server',
    });
  });

  it('warns about a delivery error from the last hour', async () => {
    await expect(
      check({
        webhookInfo: {
          url: WEBHOOK_URL,
          last_error_date: NOW_SECONDS - 600,
          last_error_message: LAST_ERROR_MESSAGE,
        },
      }),
    ).resolves.toMatchObject({
      status: 'WARNING',
      description: expect.stringContaining(LAST_ERROR_MESSAGE),
    });
  });

  it('ignores a delivery error older than an hour', async () => {
    await expect(
      check({
        webhookInfo: {
          url: WEBHOOK_URL,
          last_error_date: NOW_SECONDS - 7200,
          last_error_message: LAST_ERROR_MESSAGE,
        },
      }),
    ).resolves.toEqual({ status: 'OK' });
  });
});
