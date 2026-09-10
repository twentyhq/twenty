import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

export const slackToolFailure = (
  message: string,
  error: unknown,
): SlackToolResult => ({
  success: false,
  message,
  error: error instanceof Error ? error.message : 'Slack request failed',
});
