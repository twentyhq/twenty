import { afterEach, describe, expect, it, vi } from 'vitest';

import { TelegramApiError } from 'src/logic-functions/types/telegram-api-error';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

const BOT_TOKEN = '123:secret-token';

const stubFetch = (response: { status: number; body: unknown }) => {
  const fetchMock = vi.fn().mockResolvedValue({
    status: response.status,
    json: async () => response.body,
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

const call = () =>
  callTelegramApiOrThrow({
    botToken: BOT_TOKEN,
    method: 'sendMessage',
    params: { chat_id: 1, text: 'hi' },
  });

describe('callTelegramApiOrThrow', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the parameters as JSON and returns the result', async () => {
    const fetchMock = stubFetch({
      status: 200,
      body: { ok: true, result: { message_id: 9 } },
    });

    await expect(call()).resolves.toEqual({ message_id: 9 });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ chat_id: 1, text: 'hi' }),
      }),
    );
  });

  it('reports the error Telegram describes, with its retry delay', async () => {
    stubFetch({
      status: 429,
      body: {
        ok: false,
        error_code: 429,
        description: 'Too Many Requests: retry after 3',
        parameters: { retry_after: 3 },
      },
    });

    await expect(call()).rejects.toMatchObject({
      name: 'TelegramApiError',
      message: 'Telegram sendMessage failed: Too Many Requests: retry after 3',
      errorCode: 429,
      retryAfterSeconds: 3,
    });
  });

  it('keeps the bot token out of a network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValue(
          new Error(`connect failed for /bot${BOT_TOKEN}/sendMessage`),
        ),
    );

    const error = await call().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(TelegramApiError);
    expect(
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    ).not.toContain(BOT_TOKEN);
  });
});
