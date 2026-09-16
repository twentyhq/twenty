import { RECALL_API_ADHOC_POOL_RETRY_DELAY_MS } from 'src/logic-functions/constants/RECALL_API_ADHOC_POOL_RETRY_DELAY_MS';
import { RECALL_API_RETRY_DELAY_MS } from 'src/logic-functions/constants/RECALL_API_RETRY_DELAY_MS';

const RECALL_STATUS_ADHOC_POOL_EXHAUSTED = 507;

export const resolveRecallApiRetryDelayMs = ({
  retryAfterMs,
  status,
  attemptNumber,
  random = Math.random,
}: {
  retryAfterMs: number | undefined;
  status: number | null;
  attemptNumber: number;
  random?: () => number;
}): number => {
  if (retryAfterMs !== undefined) {
    return retryAfterMs;
  }

  if (status === RECALL_STATUS_ADHOC_POOL_EXHAUSTED) {
    return RECALL_API_ADHOC_POOL_RETRY_DELAY_MS;
  }

  // Equal jitter so retries sharing a failure instant do not re-collide.
  const baseDelayMs = RECALL_API_RETRY_DELAY_MS * attemptNumber;

  return Math.round((baseDelayMs * (1 + random())) / 2);
};
