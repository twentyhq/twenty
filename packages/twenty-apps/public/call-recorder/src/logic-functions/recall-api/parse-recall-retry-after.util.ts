import { RECALL_API_MAX_RETRY_AFTER_MS } from 'src/logic-functions/constants/recall-api-max-retry-after-ms';

// Retry-After may be delta-seconds or an HTTP date; returns undefined when absent
// or unparseable so callers fall back to their default backoff.
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
