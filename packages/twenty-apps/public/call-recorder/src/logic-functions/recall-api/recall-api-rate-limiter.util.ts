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

  if (segments[0] === 'bot') {
    return normalizeBotRateLimitPath(segments);
  }

  if (segments[0] === 'recording') {
    return normalizeRecordingRateLimitPath(segments);
  }

  if (segments[0] === 'transcript') {
    return normalizeTranscriptRateLimitPath(segments);
  }

  return pathWithoutQueryString;
};

const normalizeBotRateLimitPath = (segments: string[]): string => {
  if (segments.length === 1) {
    return '/bot/';
  }

  if (segments.length === 2) {
    return '/bot/{id}/';
  }

  if (segments.length === 3 && segments[2] === 'leave_call') {
    return '/bot/{id}/leave_call/';
  }

  return `/${segments.join('/')}/`;
};

const normalizeRecordingRateLimitPath = (segments: string[]): string => {
  if (segments.length === 2) {
    return '/recording/{id}/';
  }

  if (segments.length === 3 && segments[2] === 'create_transcript') {
    return '/recording/{id}/create_transcript/';
  }

  return `/${segments.join('/')}/`;
};

const normalizeTranscriptRateLimitPath = (segments: string[]): string => {
  if (segments.length === 1) {
    return '/transcript/';
  }

  if (segments.length === 2) {
    return '/transcript/{id}/';
  }

  return `/${segments.join('/')}/`;
};

export const resetRecallApiRateLimiter = (): void => {
  bucketsByRateLimitKey.clear();
};
