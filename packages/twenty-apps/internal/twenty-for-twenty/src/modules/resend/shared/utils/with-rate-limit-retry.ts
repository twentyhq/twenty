const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : '';
  const lower = text.toLowerCase();

  return (
    lower.includes('rate limit') ||
    lower.includes('rate_limit') ||
    lower.includes('too many requests')
  );
};

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MIN_INTERVAL_MS = 220;

let lastCallTimestamp = 0;

export const withRateLimitRetry = async <T>(
  fn: () => Promise<T>,
): Promise<T> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const elapsed = Date.now() - lastCallTimestamp;

    if (elapsed < MIN_INTERVAL_MS) await sleep(MIN_INTERVAL_MS - elapsed);

    lastCallTimestamp = Date.now();

    try {
      return await fn();
    } catch (error) {
      if (!isRateLimitError(error) || attempt === MAX_RETRIES) throw error;

      const delayMs = BASE_DELAY_MS * 2 ** attempt;

      console.warn(
        `[resend] Rate limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error('Unreachable');
};
