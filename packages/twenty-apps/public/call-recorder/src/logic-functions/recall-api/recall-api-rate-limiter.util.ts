import { isUndefined } from '@sniptt/guards';

import {
  RECALL_API_ENDPOINT_RATE_LIMIT_BURST,
  RECALL_API_ENDPOINT_RATE_LIMIT_PER_MINUTE,
} from 'src/logic-functions/constants/recall-api-rate-limit';

type TokenBucket = {
  tokens: number;
  lastRefillMs: number;
};

type RecallApiRateLimitRequest = {
  method: string;
  path: string;
  nowMs: number;
};

const REFILL_TOKENS_PER_MS =
  RECALL_API_ENDPOINT_RATE_LIMIT_PER_MINUTE / 60_000;

// Module-level so it paces each Recall endpoint within an invocation; resets on cold start.
const bucketsByRateLimitKey = new Map<string, TokenBucket>();

export const reserveRecallApiRateLimitSlotMs = ({
  method,
  path,
  nowMs,
}: RecallApiRateLimitRequest): number => {
  const bucket = getRecallApiRateLimitBucket({
    method,
    path,
  });

  if (bucket.lastRefillMs === 0) {
    bucket.lastRefillMs = nowMs;
  }

  // Never rewind past an already-scheduled reservation, so concurrent reservations
  // at the same timestamp stack their waits instead of colliding.
  const reservationStartMs = Math.max(nowMs, bucket.lastRefillMs);
  const elapsedMs = reservationStartMs - bucket.lastRefillMs;

  bucket.tokens = Math.min(
    RECALL_API_ENDPOINT_RATE_LIMIT_BURST,
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

const getRecallApiRateLimitBucket = ({
  method,
  path,
}: Pick<RecallApiRateLimitRequest, 'method' | 'path'>): TokenBucket => {
  const rateLimitKey = buildRecallApiRateLimitKey({ method, path });
  const existingBucket = bucketsByRateLimitKey.get(rateLimitKey);

  if (existingBucket !== undefined) {
    return existingBucket;
  }

  const bucket = buildRecallApiRateLimitBucket();

  bucketsByRateLimitKey.set(rateLimitKey, bucket);

  return bucket;
};

const buildRecallApiRateLimitBucket = (): TokenBucket => ({
  tokens: RECALL_API_ENDPOINT_RATE_LIMIT_BURST,
  lastRefillMs: 0,
});

const buildRecallApiRateLimitKey = ({
  method,
  path,
}: Pick<RecallApiRateLimitRequest, 'method' | 'path'>): string =>
  `${method.toUpperCase()} ${normalizeRecallApiRateLimitPath(path)}`;

const normalizeRecallApiRateLimitPath = (path: string): string => {
  const pathWithoutQueryString = path.split('?')[0] ?? path;
  const segments = pathWithoutQueryString.split('/').filter(Boolean);
  const [resourceSegment, resourceIdSegment, ...actionSegments] = segments;

  if (isUndefined(resourceSegment)) {
    return '/';
  }

  if (isUndefined(resourceIdSegment)) {
    return `/${resourceSegment}/`;
  }

  if (isKnownRecallIdScopedResource(resourceSegment)) {
    return `/${[resourceSegment, '{id}', ...actionSegments].join('/')}/`;
  }

  return pathWithoutQueryString;
};

const isKnownRecallIdScopedResource = (resourceSegment: string): boolean =>
  resourceSegment === 'bot' ||
  resourceSegment === 'recording' ||
  resourceSegment === 'transcript';

export const resetRecallApiRateLimiter = (): void => {
  bucketsByRateLimitKey.clear();
};
