import { isDefined } from 'twenty-sdk/utils';
import { vi } from 'vitest';

type TelegramApiCall = { method: string; params: Record<string, unknown> };

type TelegramApiFailure = {
  error_code: number;
  description: string;
  parameters?: { retry_after?: number };
};

export const stubTelegramApi = ({
  results = {},
  failures = {},
}: {
  results?: Record<string, unknown>;
  failures?: Record<string, TelegramApiFailure[]>;
} = {}): TelegramApiCall[] => {
  const calls: TelegramApiCall[] = [];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: { method?: string; body: string }) => {
      if (init.method === 'PUT') {
        calls.push({ method: 'uploadFile', params: { url } });

        return { ok: true, status: 200 };
      }

      if (url.includes('/file/bot')) {
        calls.push({ method: 'downloadFile', params: { url } });

        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => new Uint8Array(3).buffer,
        };
      }

      const method = url.split('/').pop() ?? '';
      const failure = failures[method]?.shift();

      calls.push({ method, params: JSON.parse(init.body) });

      return {
        status: failure?.error_code ?? 200,
        json: async () =>
          isDefined(failure)
            ? { ok: false, ...failure }
            : { ok: true, result: results[method] ?? true },
      };
    }),
  );

  return calls;
};
