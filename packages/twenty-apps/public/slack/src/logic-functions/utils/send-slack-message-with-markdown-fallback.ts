import { type SlackChatMessageBodyFields } from 'src/logic-functions/types/slack-chat-message-body-fields.type';
import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { convertMarkdownToSlackMrkdwn } from 'src/logic-functions/utils/convert-markdown-to-slack-mrkdwn';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { isSlackMarkdownFormatError } from 'src/logic-functions/utils/is-slack-markdown-format-error';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

type SendSlackMessageWithMarkdownFallbackParams = {
  messageText: string;
  messageFormat: SlackMessageBodyFormat | undefined;
  failureMessage: string;
  sendMessage: (
    bodyFields: SlackChatMessageBodyFields,
  ) => Promise<SlackToolResult>;
};

export const sendSlackMessageWithMarkdownFallback = async ({
  messageText,
  messageFormat,
  failureMessage,
  sendMessage,
}: SendSlackMessageWithMarkdownFallbackParams): Promise<SlackToolResult> => {
  try {
    return await sendMessage(
      getSlackChatMessageBodyFields(messageText, messageFormat),
    );
  } catch (error) {
    if (messageFormat !== 'markdown' || !isSlackMarkdownFormatError(error)) {
      return slackToolFailure(failureMessage, error);
    }
  }

  try {
    return await sendMessage({
      text: convertMarkdownToSlackMrkdwn(messageText),
    });
  } catch (error) {
    return slackToolFailure(failureMessage, error);
  }
};
