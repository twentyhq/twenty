/**
 * twentyhq / twenty GraphQL retry link with exponential backoff & jitter
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export function calculateBackoffWithJitter(attempt: number, opts: RetryOptions = {}): number {
  const maxRetries = opts.maxRetries || 5;
  const initialDelay = opts.initialDelayMs || 300;
  const maxDelay = opts.maxDelayMs || 5000;

  if (attempt > maxRetries) return -1;
  const exponential = initialDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * (exponential * 0.3);
  return Math.min(exponential + jitter, maxDelay);
}
