import {
  FATHOM_MAX_REQUEUE_DELAY_MILLISECONDS,
  FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS,
} from 'src/constants/fathom.constant';
import { getFathomRetryAfterDelay } from 'src/logic-functions/utils/get-fathom-retry-after-delay.util';
import { isTransientFathomError } from 'src/logic-functions/utils/is-transient-fathom-error.util';
import { isDefined } from 'src/utils/is-defined';

// The platform's own retries back off for seconds, far shorter than a Fathom
// rate-limit window or outage, so transient failures are re-enqueued instead.
export const getFathomRequeueDelay = ({
  error,
  now,
}: {
  error: unknown;
  now: Date;
}): number | undefined => {
  const retryAfterDelay = getFathomRetryAfterDelay({ error, now });

  if (isDefined(retryAfterDelay)) {
    return Math.min(retryAfterDelay, FATHOM_MAX_REQUEUE_DELAY_MILLISECONDS);
  }

  return isTransientFathomError(error)
    ? FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS
    : undefined;
};
