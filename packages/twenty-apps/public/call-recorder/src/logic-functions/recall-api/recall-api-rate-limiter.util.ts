import {
  RECALL_API_RATE_LIMIT_BURST,
  RECALL_API_RATE_LIMIT_PER_MINUTE,
} from 'src/logic-functions/constants/recall-api-rate-limit';

type TokenBucket = {
  tokens: number;
  lastRefillMs: number;
};

const REFILL_TOKENS_PER_MS = RECALL_API_RATE_LIMIT_PER_MINUTE / 60_000;

// Module-level state is intentional: it paces every Recall call in the current
// invocation and resets naturally on cold start.
const bucket: TokenBucket = {
  tokens: RECALL_API_RATE_LIMIT_BURST,
  lastRefillMs: 0,
};

// Reserves one request slot and returns how long the caller must wait before
// using it, keeping the invocation under the Recall per-minute ceiling.
export const reserveRecallApiRateLimitSlotMs = (nowMs: number): number => {
  if (bucket.lastRefillMs === 0) {
    bucket.lastRefillMs = nowMs;
  }

  const elapsedMs = Math.max(0, nowMs - bucket.lastRefillMs);

  bucket.tokens = Math.min(
    RECALL_API_RATE_LIMIT_BURST,
    bucket.tokens + elapsedMs * REFILL_TOKENS_PER_MS,
  );
  bucket.lastRefillMs = nowMs;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;

    return 0;
  }

  const waitMs = Math.ceil((1 - bucket.tokens) / REFILL_TOKENS_PER_MS);

  // The reserved token will have accrued and been consumed by the time the wait ends.
  bucket.tokens = 0;
  bucket.lastRefillMs = nowMs + waitMs;

  return waitMs;
};

export const resetRecallApiRateLimiter = (): void => {
  bucket.tokens = RECALL_API_RATE_LIMIT_BURST;
  bucket.lastRefillMs = 0;
};
