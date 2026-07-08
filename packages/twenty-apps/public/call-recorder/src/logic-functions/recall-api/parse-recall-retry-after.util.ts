import { RECALL_API_MAX_RETRY_AFTER_MS } from 'src/logic-functions/constants/recall-api-max-retry-after-ms';

// Recall returns Retry-After (delta-seconds, or an HTTP date) on 429/507 so a
// throttled retry can wait exactly as long as the API asks instead of racing back
// into the same rate-limit window. Returns undefined when the header is absent or
// unparseable, letting the caller fall back to its default backoff.
export const parseRecallRetryAfterMs = (
  retryAfterHeader: string | null,
  nowMs: number,
): number | undefined => {
  if (retryAfterHeader === null) {
    return undefined;
  }

  const trimmedHeader = retryAfterHeader.trim();

  if (trimmedHeader === '') {
    return undefined;
  }

  const deltaSeconds = Number(trimmedHeader);
  const retryAfterMs = Number.isFinite(deltaSeconds)
    ? deltaSeconds * 1000
    : Date.parse(trimmedHeader) - nowMs;

  if (Number.isNaN(retryAfterMs)) {
    return undefined;
  }

  return Math.min(Math.max(0, Math.ceil(retryAfterMs)), RECALL_API_MAX_RETRY_AFTER_MS);
};
