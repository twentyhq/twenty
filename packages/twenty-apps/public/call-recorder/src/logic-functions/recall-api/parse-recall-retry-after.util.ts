import { RECALL_API_MAX_RETRY_AFTER_MS } from 'src/logic-functions/constants/recall-api-max-retry-after-ms';

export const parseRecallRetryAfterMs = (
  retryAfterHeader: string | null,
  nowMs: number,
): number | undefined => {
  if (retryAfterHeader === null) {
    return undefined;
  }

  const trimmedRetryAfterHeader = retryAfterHeader.trim();

  if (trimmedRetryAfterHeader.length === 0) {
    return undefined;
  }

  const retryAfterSeconds = Number(trimmedRetryAfterHeader);

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return capRecallRetryAfterMs(Math.ceil(retryAfterSeconds * 1000));
  }

  const retryAfterDateMs = Date.parse(trimmedRetryAfterHeader);

  if (Number.isNaN(retryAfterDateMs)) {
    return undefined;
  }

  return capRecallRetryAfterMs(Math.max(0, retryAfterDateMs - nowMs));
};

const capRecallRetryAfterMs = (retryAfterMs: number): number | undefined => {
  if (retryAfterMs > RECALL_API_MAX_RETRY_AFTER_MS) {
    return undefined;
  }

  return retryAfterMs;
};
