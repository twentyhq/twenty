import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stubTelegramApi } from 'src/__tests__/utils/stub-telegram-api';
import { telegramPostInstallHandler } from 'src/logic-functions/telegram-post-install';

describe('installing or upgrading the Telegram app', () => {
  let telegramCalls: ReturnType<typeof stubTelegramApi>;

  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:bot-token');
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'webhook-secret');
    vi.stubEnv(
      'TWENTY_SERVER_ROUTES_URL',
      'https://twenty.example/webhooks/server/registration',
    );
    telegramCalls = stubTelegramApi();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('registers the webhook again with the update types this version handles', async () => {
    await telegramPostInstallHandler();

    expect(telegramCalls).toEqual([
      {
        method: 'setWebhook',
        params: expect.objectContaining({
          secret_token: 'webhook-secret',
          allowed_updates: ['message', 'my_chat_member', 'callback_query'],
        }),
      },
    ]);
  });

  it('fails when Telegram refuses the webhook, so the job is retried', async () => {
    vi.unstubAllGlobals();
    stubTelegramApi({
      failures: {
        setWebhook: [{ error_code: 429, description: 'Too Many Requests' }],
      },
    });

    await expect(telegramPostInstallHandler()).rejects.toThrow();
  });

  it('leaves the webhook alone while the bot is not configured', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');

    await telegramPostInstallHandler();

    expect(telegramCalls).toEqual([]);
  });
});
