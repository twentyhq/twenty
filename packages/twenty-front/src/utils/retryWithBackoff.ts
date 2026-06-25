import { sleep } from '~/utils/sleep';

type ShouldRetryFn = (error: unknown) => boolean;

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    baseDelayMs = 1000,
    shouldRetry,
  }: {
    maxRetries?: number;
    baseDelayMs?: number;
    shouldRetry: ShouldRetryFn;
  },
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (!shouldRetry(error) || isLastAttempt) {
        throw error;
      }

      await sleep(baseDelayMs * (attempt + 1));
    }
  }

  throw new Error('Unreachable');
};
