import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_API_BASE_URL } from 'src/logic-functions/constants/telegram-api-base-url';
import { TELEGRAM_API_REQUEST_TIMEOUT_MS } from 'src/logic-functions/constants/telegram-api-request-timeout-ms';
import { TelegramApiError } from 'src/logic-functions/types/telegram-api-error';

type TelegramApiResponseBody<TResult> = {
  ok?: boolean;
  result?: TResult;
  error_code?: number;
  description?: string;
  parameters?: { retry_after?: number };
};

export const callTelegramApiOrThrow = async <TResult>({
  botToken,
  method,
  params,
  timeoutMs = TELEGRAM_API_REQUEST_TIMEOUT_MS,
}: {
  botToken: string;
  method: string;
  params?: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<TResult> => {
  const response = await fetch(
    `${TELEGRAM_API_BASE_URL}/bot${botToken}/${method}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(params ?? {}),
      signal: AbortSignal.timeout(timeoutMs),
    },
  ).catch(() => {
    throw new TelegramApiError({
      method,
      description: 'the request did not reach Telegram',
    });
  });

  const body: TelegramApiResponseBody<TResult> | undefined = await response
    .json()
    .catch(() => undefined);

  if (!body?.ok || !isDefined(body.result)) {
    throw new TelegramApiError({
      method,
      errorCode: body?.error_code ?? response.status,
      description: isNonEmptyString(body?.description)
        ? body.description
        : `HTTP ${response.status}`,
      retryAfterSeconds: body?.parameters?.retry_after,
    });
  }

  return body.result;
};
