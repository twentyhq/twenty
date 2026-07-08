import { RECALL_API_ADHOC_POOL_RETRY_DELAY_MS } from 'src/logic-functions/constants/recall-api-adhoc-pool-retry-delay-ms';
import { RECALL_API_RETRY_DELAY_MS } from 'src/logic-functions/constants/recall-api-retry-delay-ms';

const RECALL_STATUS_RATE_LIMITED = 429;
const RECALL_STATUS_CONFLICT = 409;
const RECALL_STATUS_ADHOC_POOL_EXHAUSTED = 507;

const isRecallServerError = (status: number): boolean => status >= 500;

// Client errors (400/401/402/403/405) cannot succeed on a retry, so they are excluded.
export const isRetryableRecallApiStatus = (status: number): boolean =>
  status === RECALL_STATUS_RATE_LIMITED ||
  status === RECALL_STATUS_CONFLICT ||
  isRecallServerError(status);

export const resolveRecallApiRetryDelayMs = ({
  retryAfterMs,
  status,
  attemptNumber,
}: {
  retryAfterMs: number | undefined;
  status: number | null;
  attemptNumber: number;
}): number => {
  if (retryAfterMs !== undefined) {
    return retryAfterMs;
  }

  if (status === RECALL_STATUS_ADHOC_POOL_EXHAUSTED) {
    return RECALL_API_ADHOC_POOL_RETRY_DELAY_MS;
  }

  return RECALL_API_RETRY_DELAY_MS * attemptNumber;
};
