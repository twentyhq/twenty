import { SLACK_RATE_LIMIT_RETRY_MAX_WAIT_MS } from 'src/logic-functions/constants/slack-rate-limit-retry-max-wait-ms';
import { isSlackRateLimitedError } from 'src/logic-functions/utils/is-slack-rate-limited-error';

// the client rejects rate limited calls outright, which is right for reads but
// loses the member their answer on a write, so wait out a short Retry-After
export const retrySlackCallWhenRateLimited = async <TResult>(
  call: () => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await call();
  } catch (error) {
    if (!isSlackRateLimitedError(error)) {
      throw error;
    }

    const waitMs = error.retryAfter * 1000;

    if (waitMs > SLACK_RATE_LIMIT_RETRY_MAX_WAIT_MS) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, waitMs));

    return await call();
  }
};
