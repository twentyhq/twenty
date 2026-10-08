import { isNonEmptyArray, isNumber, isUndefined } from '@sniptt/guards';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { parseRetryAfterHeaderMilliseconds } from 'src/logic-functions/utils/parse-retry-after-header-milliseconds.util';
import { sleepForMilliseconds } from 'src/logic-functions/utils/sleep-for-milliseconds.util';

const MAX_ATTEMPTS = 8;
const MAX_TOTAL_WAIT_MILLISECONDS = 120_000;
const MAX_RETRY_AFTER_MILLISECONDS = 60_000;

const getRateLimitDelayMilliseconds = async (
  response: Response,
): Promise<number | undefined> => {
  const headerDelayMilliseconds =
    parseRetryAfterHeaderMilliseconds(response.headers.get('retry-after')) ?? 0;

  try {
    const body = asRecord(await response.clone().json());
    const errors = body?.errors;
    const data = asRecord(body?.data);

    // Retrying a partially successful mutation could repeat an already-applied write
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
          const delayMilliseconds = asRecord(
            asRecord(error)?.extensions,
          )?.retryAfterMs;

          return isNumber(delayMilliseconds) &&
            Number.isFinite(delayMilliseconds)
            ? delayMilliseconds
            : 0;
        }),
      );
    }
  } catch {
    // An HTTP 429 may carry a proxy's plain-text body instead of GraphQL errors
  }

  return response.status === 429 ? headerDelayMilliseconds : undefined;
};

export const fetchWithRateLimitRetry: typeof fetch = async (input, options) => {
  let totalWaitMilliseconds = 0;

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(input, options);
    const retryAfterMilliseconds =
      await getRateLimitDelayMilliseconds(response);

    if (isUndefined(retryAfterMilliseconds) || options?.signal?.aborted) {
      return response;
    }

    const delayMilliseconds =
      Math.max(
        Math.min(2_000 * 2 ** (attempt - 1), 30_000),
        Math.min(retryAfterMilliseconds, MAX_RETRY_AFTER_MILLISECONDS),
      ) +
      Math.random() * 1_000;

    await response.body?.cancel();

    if (
      attempt >= MAX_ATTEMPTS ||
      totalWaitMilliseconds + delayMilliseconds > MAX_TOTAL_WAIT_MILLISECONDS
    ) {
      throw new RetryableLogicFunctionError(
        '[granola] Twenty API rate limit retry budget exhausted',
      );
    }

    totalWaitMilliseconds += delayMilliseconds;
    await sleepForMilliseconds(delayMilliseconds);
  }
};
