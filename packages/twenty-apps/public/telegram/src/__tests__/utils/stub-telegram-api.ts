import { vi } from 'vitest';

type TelegramApiCall = { method: string; params: Record<string, unknown> };

export const stubTelegramApi = (
  results: Record<string, unknown> = {},
): TelegramApiCall[] => {
  const calls: TelegramApiCall[] = [];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: { body: string }) => {
      const method = url.split('/').pop() ?? '';

      calls.push({ method, params: JSON.parse(init.body) });

      return {
        status: 200,
        json: async () => ({ ok: true, result: results[method] ?? true }),
      };
    }),
  );

  return calls;
};
