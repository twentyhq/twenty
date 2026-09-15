import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

export const buildSlackAnswerDeliveryFailureMessage = (
  result: SlackToolResult,
): string =>
  `Could not deliver Slack answer: ${result.error ?? result.message}`;
