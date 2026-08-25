import { parseRetryAfterMs } from 'src/logic-functions/utils/parse-retry-after-ms.util';
import { sleep } from 'src/logic-functions/utils/sleep.util';

const MAX_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_JITTER_MS = 1_000;

const RETRYABLE_HTTP_STATUSES = new Set([429, 502, 503, 504]);

const isAbortError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.name === 'AbortError' || error.name === 'TimeoutError');

// Enqueued batches run in parallel, so core API calls must absorb rate limiting themselves.
export const createCoreApiRetryingFetch =
  (baseFetch: typeof globalThis.fetch = fetch): typeof globalThis.fetch =>
  async (input, init) => {
    for (let attempt = 1; ; attempt += 1) {
      let response: Response | undefined;

      try {
        response = await baseFetch(input, init);
      } catch (error) {
        if (isAbortError(error) || attempt >= MAX_ATTEMPTS) {
          throw error;
        }
      }

      if (response !== undefined) {
        if (
          !RETRYABLE_HTTP_STATUSES.has(response.status) ||
          attempt >= MAX_ATTEMPTS
        ) {
          return response;
        }
      }

      const backoffMs = Math.min(
        INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1),
        MAX_RETRY_DELAY_MS,
      );
      const retryAfterMs =
        response === undefined
          ? 0
          : (parseRetryAfterMs(
              response.headers.get('retry-after'),
              Date.now(),
              MAX_RETRY_DELAY_MS,
            ) ?? 0);

      await response?.body?.cancel().catch(() => undefined);
      await sleep(
        Math.max(backoffMs, retryAfterMs) + Math.random() * MAX_JITTER_MS,
      );
    }
  };
