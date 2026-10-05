import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

const MAX_ATTEMPTS = 8;
const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_RETRY_AFTER_MS = 60_000;
const MAX_JITTER_MS = 1_000;
const MAX_TOTAL_WAIT_MS = 120_000;

// The client SDK surfaces HTTP failures as plain Error messages built from the
// status text and raw response body, so retryability has to be detected from
// the message text. Covers rate limiting (429, Cloudflare 1015), transient
// gateway errors (502/503/504) and network-level failures.
const RETRYABLE_ERROR_PATTERN =
  /\b(429|1015|too many requests|rate ?limit\w*|502|503|504|bad gateway|gateway time-?out|service unavailable|timed? ?out|fetch failed|econnreset|econnrefused|socket hang up)\b/i;

type GraphqlErrorEntry = {
  extensions?: { code?: string; retryAfterMs?: number };
};

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getGraphqlErrors = (error: unknown): GraphqlErrorEntry[] => {
  const errors = (error as { errors?: unknown } | null)?.errors;

  return Array.isArray(errors) ? errors : [];
};

const findRateLimitedError = (error: unknown): GraphqlErrorEntry | undefined =>
  getGraphqlErrors(error).find(
    (graphqlError) => graphqlError.extensions?.code === 'RATE_LIMITED',
  );

const isRetryableError = (error: unknown): boolean =>
  findRateLimitedError(error) !== undefined ||
  RETRYABLE_ERROR_PATTERN.test(getErrorMessage(error));

const parseRetryAfterMs = (error: unknown): number | undefined => {
  const retryAfterMs = findRateLimitedError(error)?.extensions?.retryAfterMs;

  if (typeof retryAfterMs === 'number') {
    return retryAfterMs;
  }

  const match = getErrorMessage(error).match(/"retry_after"\s*:\s*(\d+)/);

  return match ? Number(match[1]) * 1_000 : undefined;
};

export const executeWithRetry = async <TResult>(
  execute: () => TResult,
): Promise<Awaited<TResult>> => {
  let totalWaitMs = 0;

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await execute();
    } catch (error) {
      if (!isRetryableError(error)) {
        throw error;
      }

      const backoffMs = Math.min(
        INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1),
        MAX_RETRY_DELAY_MS,
      );
      const retryAfterMs = Math.min(
        parseRetryAfterMs(error) ?? 0,
        MAX_RETRY_AFTER_MS,
      );
      const waitMs =
        Math.max(backoffMs, retryAfterMs) + Math.random() * MAX_JITTER_MS;

      if (attempt >= MAX_ATTEMPTS || totalWaitMs + waitMs > MAX_TOTAL_WAIT_MS) {
        throw new RetryableLogicFunctionError(getErrorMessage(error));
      }

      totalWaitMs += waitMs;
      await sleep(waitMs);
    }
  }
};
