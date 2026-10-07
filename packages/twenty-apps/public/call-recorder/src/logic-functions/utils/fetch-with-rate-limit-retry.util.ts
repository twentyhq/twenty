import {
  isNonEmptyArray,
  isNumber,
  isString,
  isUndefined,
} from '@sniptt/guards';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { fetchWithTransientRetry } from 'src/logic-functions/utils/fetch-with-transient-retry.util';

const MAX_ATTEMPTS = 8;
const MAX_TOTAL_WAIT_MS = 120_000;
const MAX_RETRY_AFTER_MS = 60_000;

const getRateLimitDelayMs = async (
  response: Response,
): Promise<number | undefined> => {
  const retryAfter = response.headers.get('retry-after');
  const headerDelayMs = isString(retryAfter)
    ? Number.isFinite(Number(retryAfter))
      ? Number(retryAfter) * 1_000
      : Date.parse(retryAfter) - Date.now()
    : 0;

  try {
    const body = asRecord(await response.clone().json());
    const errors = body?.errors;
    const data = asRecord(body?.data);

    // Retrying a partially successful mutation could repeat an already-applied write.
    if (
      isNonEmptyArray(errors) &&
      Object.values(data ?? {}).every((value) => value === null) &&
      errors.every(
        (error) =>
          asRecord(asRecord(error)?.extensions)?.code === 'RATE_LIMITED',
      )
    ) {
      return Math.max(
        0,
        ...errors.map((error) => {
          const delayMs = asRecord(asRecord(error)?.extensions)?.retryAfterMs;
          return isNumber(delayMs) && Number.isFinite(delayMs) ? delayMs : 0;
        }),
      );
    }
  } catch {
    // An HTTP 429 may contain a proxy's plain-text body instead of GraphQL errors.
  }

  return response.status === 429
    ? Math.max(0, Number.isFinite(headerDelayMs) ? headerDelayMs : 0)
    : undefined;
};

export const fetchWithRateLimitRetry: typeof fetch = async (input, options) => {
  let totalWaitMs = 0;

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetchWithTransientRetry(input, options);
    const retryAfterMs = await getRateLimitDelayMs(response);

    if (isUndefined(retryAfterMs) || options?.signal?.aborted) {
      return response;
    }

    const delayMs =
      Math.max(
        Math.min(2_000 * 2 ** (attempt - 1), 30_000),
        Math.min(retryAfterMs, MAX_RETRY_AFTER_MS),
      ) +
      Math.random() * 1_000;

    await response.body?.cancel();

    if (attempt >= MAX_ATTEMPTS || totalWaitMs + delayMs > MAX_TOTAL_WAIT_MS) {
      throw new RetryableLogicFunctionError(
        '[call-recorder] Twenty API rate limit retry budget exhausted',
      );
    }

    totalWaitMs += delayMs;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
};
