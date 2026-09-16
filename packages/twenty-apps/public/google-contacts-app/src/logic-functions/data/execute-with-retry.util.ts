import { describeError } from 'src/logic-functions/data/describe-error.util';

const MAX_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_JITTER_MS = 1_000;

// The generated core client throws `${statusText}: ${rawBody}`, so retryability
// has to be read out of the message. Only the status text prefix and an
// explicit status field in the body count: a bare number anywhere in the body
// would match record data such as a phone number. Callers holding a richer
// error pass their own policy instead.
const RETRYABLE_STATUS_TEXT_PATTERN =
  /^\s*(too many requests|internal server error|bad gateway|service unavailable|gateway time-?out)\b/i;

const RETRYABLE_BODY_STATUS_PATTERN =
  /"(?:status|statusCode|code)"\s*:\s*"?(?:429|500|502|503|504)\b/i;

// Cloudflare rate limiting and the fetch-level failures the runtime raises
// before any response exists.
const RETRYABLE_NETWORK_ERROR_PATTERN =
  /\b(error code: 1015|fetch failed|network error|econnreset|econnrefused|econnaborted|etimedout|socket hang up|timed? ?out)\b/i;

const isRetryableCoreApiError = (message: string): boolean =>
  RETRYABLE_STATUS_TEXT_PATTERN.test(message) ||
  RETRYABLE_BODY_STATUS_PATTERN.test(message) ||
  RETRYABLE_NETWORK_ERROR_PATTERN.test(message);

export type RetryPolicy = {
  isRetryable: (error: unknown) => boolean;
  readRetryAfterMs?: (error: unknown) => number | undefined;
};

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const CORE_API_RETRY_POLICY: RetryPolicy = {
  isRetryable: (error) => isRetryableCoreApiError(describeError(error)),
};

export const executeWithRetry = async <TResult>(
  execute: () => TResult,
  policy: RetryPolicy = CORE_API_RETRY_POLICY,
): Promise<Awaited<TResult>> => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await execute();
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !policy.isRetryable(error)) {
        throw error;
      }

      const backoffMs = Math.min(
        INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1),
        MAX_RETRY_DELAY_MS,
      );
      const retryAfterMs = Math.min(
        policy.readRetryAfterMs?.(error) ?? 0,
        MAX_RETRY_DELAY_MS,
      );
      const jitterMs = Math.random() * MAX_JITTER_MS;

      await sleep(Math.max(backoffMs, retryAfterMs) + jitterMs);
    }
  }
};
