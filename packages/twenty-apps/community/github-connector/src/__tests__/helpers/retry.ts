function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /Limit reached|rate.?limit/i.test(err.message);
}

export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  { attempts = 3, baseDelayMs = 5000 }: { attempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err) || attempt === attempts - 1) {
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.log(
        `[test-retry] rate-limited; sleeping ${delay}ms (attempt ${attempt + 1}/${attempts})`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
