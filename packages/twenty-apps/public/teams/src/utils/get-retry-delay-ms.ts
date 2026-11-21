import { isDefined } from 'twenty-sdk/utils';

export const getRetryDelayMs = ({
  attempt,
  retryAfterMs,
  baseDelayMs,
  jitterRatio,
  minRetryAfterDelayMs,
  maxDelayMs,
}: {
  attempt: number;
  retryAfterMs: number | undefined;
  baseDelayMs: number;
  jitterRatio: number;
  minRetryAfterDelayMs: number;
  maxDelayMs: number;
}): number => {
  if (isDefined(retryAfterMs)) {
    // Retrying sooner than asked only earns another refusal, so a wait over budget means no retry.
    if (retryAfterMs > maxDelayMs) {
      return 0;
    }

    const flooredRetryAfterMs = Math.max(retryAfterMs, minRetryAfterDelayMs);

    if (flooredRetryAfterMs > 0) {
      return flooredRetryAfterMs;
    }
  }

  return Math.min(
    baseDelayMs * 2 ** attempt * (1 + Math.random() * jitterRatio),
    maxDelayMs,
  );
};
