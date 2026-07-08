import { RECALL_API_ADHOC_POOL_RETRY_DELAY_MS } from 'src/logic-functions/constants/recall-api-adhoc-pool-retry-delay-ms';
import { RECALL_API_RETRY_DELAY_MS } from 'src/logic-functions/constants/recall-api-retry-delay-ms';

// Recall's documented HTTP responses, named so each retry decision explains
// itself. Reference: https://docs.recall.ai/reference/errors

// 429 Too Many Requests: a rate limit was hit. Recall returns a Retry-After header.
const RECALL_STATUS_RATE_LIMITED = 429;

// 409 Conflict: a concurrent write to the same resource. Recall asks callers to
// retry with backoff.
const RECALL_STATUS_CONFLICT = 409;

// 507 Insufficient Storage: the shared ad-hoc bot pool is momentarily drained.
// Recall asks callers to retry after ~30s (Retry-After header when present).
const RECALL_STATUS_ADHOC_POOL_EXHAUSTED = 507;

// 5xx: Recall dropped the request under load (502/503/504) or hit an unexpected
// server error. These are transient, so retrying is safe.
const isRecallServerError = (status: number): boolean => status >= 500;

// Whether a failed Recall response can plausibly succeed on a later attempt.
// Client errors are never retried because retrying cannot change the outcome:
//   400 Bad Request        - the payload itself is invalid
//   401 Unauthorized       - missing or invalid API key
//   402 Payment Required   - insufficient credit balance
//   403 Forbidden          - blocked by Recall's firewall (payload or IP reputation)
//   405 Method Not Allowed - e.g. deleting a bot that was already dispatched
export const isRetryableRecallApiStatus = (status: number): boolean =>
  status === RECALL_STATUS_RATE_LIMITED ||
  status === RECALL_STATUS_CONFLICT ||
  isRecallServerError(status);

// How long to wait before the next attempt. A server-provided Retry-After always
// wins; otherwise a drained ad-hoc bot pool gets the ~30s it needs to refill, and
// everything else backs off linearly, growing with each attempt.
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
