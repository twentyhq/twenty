const MAX_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_JITTER_MS = 1_000;

// The client SDK surfaces HTTP failures as plain Error messages built from the
// status text and raw response body, so retryability has to be detected from
// the message text. Covers rate limiting (429, Cloudflare 1015), transient
// gateway errors (502/503/504) and network-level failures.
const RETRYABLE_ERROR_PATTERN =
  /\b(429|1015|too many requests|rate ?limit\w*|502|503|504|bad gateway|gateway time-?out|service unavailable|timed? ?out|fetch failed|econnreset|econnrefused|socket hang up)\b/i;

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const isRetryableError = (error: unknown): boolean =>
  RETRYABLE_ERROR_PATTERN.test(getErrorMessage(error));

const parseRetryAfterMs = (error: unknown): number | undefined => {
  const match = getErrorMessage(error).match(/"retry_after"\s*:\s*(\d+)/);
  return match ? Number(match[1]) * 1_000 : undefined;
};

export const executeWithRetry = async <TResult>(
  execute: () => TResult,
): Promise<Awaited<TResult>> => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await execute();
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !isRetryableError(error)) {
        throw error;
      }

      const backoffMs = Math.min(
        INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1),
        MAX_RETRY_DELAY_MS,
      );
      const retryAfterMs = Math.min(
        parseRetryAfterMs(error) ?? 0,
        MAX_RETRY_DELAY_MS,
      );
      const jitterMs = Math.random() * MAX_JITTER_MS;

      await sleep(Math.max(backoffMs, retryAfterMs) + jitterMs);
    }
  }
};
