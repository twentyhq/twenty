import { isDefined } from '@utils/is-defined';

import {
  RATE_LIMIT_BASE_DELAY_MS,
  RATE_LIMIT_MAX_RETRIES,
  RATE_LIMIT_MIN_INTERVAL_MS,
} from '@modules/resend/constants/sync-config';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : typeof error === 'string'
          ? error
          : '';
  const lower = text.toLowerCase();

  return (
    lower.includes('rate limit') ||
    lower.includes('rate_limit') ||
    lower.includes('too many requests')
  );
};

const isResendErrorResponse = (
  value: unknown,
): value is { error: unknown; data?: unknown } => {
  if (typeof value !== 'object' || value === null) return false;

  return (
    'error' in value &&
    isDefined((value as { error: unknown }).error)
  );
};

const lastCallTimestampByChannel = new Map<string, number>();
const DEFAULT_CHANNEL = 'default';

export const withRateLimitRetry = async <T>(
  fn: () => Promise<T>,
  options?: { channel?: string },
): Promise<T> => {
  const channel = options?.channel ?? DEFAULT_CHANNEL;

  for (let attempt = 0; attempt <= RATE_LIMIT_MAX_RETRIES; attempt++) {
    const lastCallTimestamp = lastCallTimestampByChannel.get(channel) ?? 0;
    const elapsed = Date.now() - lastCallTimestamp;

    if (elapsed < RATE_LIMIT_MIN_INTERVAL_MS) {
      await sleep(RATE_LIMIT_MIN_INTERVAL_MS - elapsed);
    }

    lastCallTimestampByChannel.set(channel, Date.now());

    try {
      const result = await fn();

      if (
        isResendErrorResponse(result) &&
        isRateLimitError(result.error) &&
        attempt < RATE_LIMIT_MAX_RETRIES
      ) {
        const delayMs = RATE_LIMIT_BASE_DELAY_MS * 2 ** attempt;

        console.warn(
          `[resend] Rate limited (response.error), retrying in ${delayMs}ms (attempt ${attempt + 1}/${RATE_LIMIT_MAX_RETRIES})`,
        );
        await sleep(delayMs);
        continue;
      }

      return result;
    } catch (error) {
      if (!isRateLimitError(error) || attempt === RATE_LIMIT_MAX_RETRIES) {
        throw error;
      }

      const delayMs = RATE_LIMIT_BASE_DELAY_MS * 2 ** attempt;

      console.warn(
        `[resend] Rate limited (thrown), retrying in ${delayMs}ms (attempt ${attempt + 1}/${RATE_LIMIT_MAX_RETRIES})`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error('Unreachable');
};
