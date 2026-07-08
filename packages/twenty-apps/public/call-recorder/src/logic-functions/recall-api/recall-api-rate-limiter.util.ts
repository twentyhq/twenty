import {
  RECALL_API_RATE_LIMIT_BURST,
  RECALL_API_RATE_LIMIT_PER_MINUTE,
} from 'src/logic-functions/constants/recall-api-rate-limit';

type TokenBucket = {
  tokens: number;
  lastRefillMs: number;
};

const REFILL_TOKENS_PER_MS = RECALL_API_RATE_LIMIT_PER_MINUTE / 60_000;

// Module-level so it paces every Recall call within an invocation; resets on cold start.
const bucket: TokenBucket = {
  tokens: RECALL_API_RATE_LIMIT_BURST,
  lastRefillMs: 0,
};

export const reserveRecallApiRateLimitSlotMs = (nowMs: number): number => {
  if (bucket.lastRefillMs === 0) {
    bucket.lastRefillMs = nowMs;
  }

  // Never rewind past an already-scheduled reservation, so concurrent reservations
  // at the same timestamp stack their waits instead of colliding.
  const reservationStartMs = Math.max(nowMs, bucket.lastRefillMs);
  const elapsedMs = reservationStartMs - bucket.lastRefillMs;

  bucket.tokens = Math.min(
    RECALL_API_RATE_LIMIT_BURST,
    bucket.tokens + elapsedMs * REFILL_TOKENS_PER_MS,
  );
  bucket.lastRefillMs = reservationStartMs;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;

    return reservationStartMs - nowMs;
  }

  const waitMs = Math.ceil((1 - bucket.tokens) / REFILL_TOKENS_PER_MS);
  const reservedAtMs = reservationStartMs + waitMs;

  // The reserved token will have accrued and been consumed once the wait ends.
  bucket.tokens = 0;
  bucket.lastRefillMs = reservedAtMs;

  return reservedAtMs - nowMs;
};

export const resetRecallApiRateLimiter = (): void => {
  bucket.tokens = RECALL_API_RATE_LIMIT_BURST;
  bucket.lastRefillMs = 0;
};
