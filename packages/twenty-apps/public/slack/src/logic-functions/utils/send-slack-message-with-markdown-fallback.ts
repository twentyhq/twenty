import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { isSlackMarkdownFormatError } from 'src/logic-functions/utils/is-slack-markdown-format-error';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

type SendSlackMessageWithMarkdownFallbackParams = {
  messageFormat: SlackMessageBodyFormat | undefined;
  failureMessage: string;
  sendMessage: (
    messageFormat: SlackMessageBodyFormat | undefined,
  ) => Promise<SlackToolResult>;
};

export const sendSlackMessageWithMarkdownFallback = async ({
  messageFormat,
  failureMessage,
  sendMessage,
}: SendSlackMessageWithMarkdownFallbackParams): Promise<SlackToolResult> => {
  try {
    return await sendMessage(messageFormat);
  } catch (error) {
    if (messageFormat !== 'markdown' || !isSlackMarkdownFormatError(error)) {
      return slackToolFailure(failureMessage, error);
    }
  }

  try {
    return await sendMessage('plain');
  } catch (error) {
    return slackToolFailure(failureMessage, error);
  }
};
