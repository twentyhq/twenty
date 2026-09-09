import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { isSlackRateLimitedError } from 'src/logic-functions/utils/is-slack-rate-limited-error';

export const slackToolFailure = (
  message: string,
  error: unknown,
): SlackToolResult => ({
  success: false,
  message,
  error: error instanceof Error ? error.message : 'Slack request failed',
  // callers defer delivery on this rather than waiting out the window inline
  ...(isSlackRateLimitedError(error)
    ? { retryAfterSeconds: error.retryAfter }
    : {}),
});
