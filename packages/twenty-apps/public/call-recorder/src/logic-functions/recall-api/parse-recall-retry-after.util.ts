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

  if (/^\d+$/.test(trimmedRetryAfterHeader)) {
    return capRecallRetryAfterMs(Number(trimmedRetryAfterHeader) * 1000);
  }

  // Malformed numeric forms (1.5, 1e2, 0x10) would be misread as dates by Date.parse.
  if (!Number.isNaN(Number(trimmedRetryAfterHeader))) {
    return undefined;
  }

  const retryAfterDateMs = Date.parse(trimmedRetryAfterHeader);

  if (Number.isNaN(retryAfterDateMs)) {
    return undefined;
  }

  return capRecallRetryAfterMs(Math.max(0, retryAfterDateMs - nowMs));
};

const capRecallRetryAfterMs = (retryAfterMs: number): number =>
  Math.min(retryAfterMs, RECALL_API_MAX_RETRY_AFTER_MS);
