import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { sendSlackMessage } from 'src/logic-functions/utils/send-slack-message';

// the logic function runtime calls this with (input, context), so it must stay
// single-argument: internal callers that need options use sendSlackMessage
export const slackPostMessageHandler = async (
  parameters: SlackPostMessageInput,
): Promise<SlackToolResult> => await sendSlackMessage(parameters);
