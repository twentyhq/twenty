import { SLACK_RATE_LIMIT_RETRY_BUDGET_MS } from 'src/logic-functions/constants/slack-rate-limit-retry-budget-ms';
import { isSlackRateLimitedError } from 'src/logic-functions/utils/is-slack-rate-limited-error';

// rejecting a rate limited write outright would cost the member the answer
export const retrySlackCallWhenRateLimited = async <TResult>({
  call,
  budgetMs = SLACK_RATE_LIMIT_RETRY_BUDGET_MS,
}: {
  call: () => Promise<TResult>;
  budgetMs?: number;
}): Promise<TResult> => {
  const startedAtMs = Date.now();

  try {
    return await call();
  } catch (error) {
    if (!isSlackRateLimitedError(error)) {
      throw error;
    }

    const waitMs = error.retryAfter * 1000;

    if (Date.now() - startedAtMs + waitMs > budgetMs) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, waitMs));

    return await call();
  }
};
