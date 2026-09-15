const MAX_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_JITTER_MS = 1_000;

const RETRYABLE_ERROR_PATTERN =
  /\b(429|1015|too many requests|rate ?limit\w*|502|503|504|bad gateway|gateway time-?out|service unavailable|timed? ?out|fetch failed|econnreset|econnrefused|socket hang up)\b/i;

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// Last resort for callers with no structured error to inspect, such as the
// GraphQL client: prefer passing an explicit classifier, since a message match
// also fires on an error whose text merely quotes a record containing "429".
const hasRetryableErrorMessage = (error: unknown): boolean =>
  RETRYABLE_ERROR_PATTERN.test(getErrorMessage(error));

export const executeWithRetry = async <TResult>(
  execute: () => TResult,
  isRetryable: (error: unknown) => boolean = hasRetryableErrorMessage,
): Promise<Awaited<TResult>> => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await execute();
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !isRetryable(error)) {
        throw error;
      }

      const backoffMs = Math.min(
        INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1),
        MAX_RETRY_DELAY_MS,
      );
      const jitterMs = Math.random() * MAX_JITTER_MS;

      await sleep(backoffMs + jitterMs);
    }
  }
};
