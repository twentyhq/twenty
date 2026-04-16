const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    return (
      message.includes('rate_limit') ||
      message.includes('rate limit') ||
      message.includes('too many requests')
    );
  }

  if (typeof error === 'object' && error !== null) {
    const serialized = JSON.stringify(error).toLowerCase();

    return (
      serialized.includes('rate_limit') ||
      serialized.includes('rate limit') ||
      serialized.includes('too many requests')
    );
  }

  return false;
};

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MIN_INTERVAL_MS = 220;

let lastCallTimestamp = 0;

export const withRateLimitRetry = async <T>(
  fn: () => Promise<T>,
): Promise<T> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const now = Date.now();
    const elapsed = now - lastCallTimestamp;

    if (elapsed < MIN_INTERVAL_MS) {
      await sleep(MIN_INTERVAL_MS - elapsed);
    }

    lastCallTimestamp = Date.now();

    try {
      return await fn();
    } catch (error) {
      if (!isRateLimitError(error) || attempt === MAX_RETRIES) {
        throw error;
      }

      const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);

      console.warn(
        `[resend] Rate limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error('Unreachable');
};
