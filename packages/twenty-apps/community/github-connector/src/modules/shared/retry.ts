export type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (err: unknown) => boolean;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function retry<T>(
  label: string,
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const requestedRetries = options.retries ?? 3;
  const retries = Math.max(
    Math.floor(Number.isFinite(requestedRetries) ? requestedRetries : 1),
    1,
  );
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 5_000;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);

      if (attempt === retries || !shouldRetry(err)) {
        console.log(
          `[retry] ${label} attempt ${attempt}/${retries} failed (giving up): ${msg}`,
        );
        throw err;
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const jittered = delay + Math.floor(Math.random() * baseDelayMs);
      console.log(
        `[retry] ${label} attempt ${attempt}/${retries} failed, retrying in ${jittered}ms: ${msg}`,
      );
      await sleep(jittered);
    }
  }

  throw lastErr;
}
