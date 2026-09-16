const MAX_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_JITTER_MS = 1_000;

const RETRYABLE_ERROR_CODES = ['RATE_LIMITED', 'TIMEOUT'];
const RETRYABLE_ERROR_SUB_CODES = ['LIMIT_REACHED'];

const RETRYABLE_TRANSPORT_ERROR_PATTERN =
  /\b(429|1015|too many requests|502|503|504|bad gateway|gateway time-?out|service unavailable|timed? ?out|fetch failed|econnreset|econnrefused|socket hang up)\b/i;

type GraphqlErrorLike = {
  extensions?: { code?: unknown; subCode?: unknown; retryAfterMs?: unknown };
};

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getGraphqlErrors = (error: unknown): GraphqlErrorLike[] => {
  const errors = (error as { errors?: unknown })?.errors;

  return Array.isArray(errors) ? (errors as GraphqlErrorLike[]) : [];
};

const isRetryableGraphqlError = ({ extensions }: GraphqlErrorLike): boolean =>
  RETRYABLE_ERROR_CODES.includes(extensions?.code as string) ||
  RETRYABLE_ERROR_SUB_CODES.includes(extensions?.subCode as string);

const isRetryableError = (error: unknown): boolean =>
  getGraphqlErrors(error).some(isRetryableGraphqlError) ||
  RETRYABLE_TRANSPORT_ERROR_PATTERN.test(getErrorMessage(error));

const parseRetryAfterMs = (error: unknown): number | undefined => {
  for (const { extensions } of getGraphqlErrors(error)) {
    if (typeof extensions?.retryAfterMs === 'number') {
      return extensions.retryAfterMs;
    }
  }

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
