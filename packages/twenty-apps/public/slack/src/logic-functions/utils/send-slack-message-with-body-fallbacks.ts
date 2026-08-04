import { type SlackChatMessageBodyFields } from 'src/logic-functions/types/slack-chat-message-body-fields.type';
import { type SlackMessageBody } from 'src/logic-functions/types/slack-message-body.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackChatMessageBodyFields } from 'src/logic-functions/utils/get-slack-chat-message-body-fields';
import { getSlackMessageBodyFallbacks } from 'src/logic-functions/utils/get-slack-message-body-fallbacks';
import { isSlackMarkdownFormatError } from 'src/logic-functions/utils/is-slack-markdown-format-error';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

type SendSlackMessageWithBodyFallbacksParams = {
  messageText: string;
  messageBody: SlackMessageBody;
  failureMessage: string;
  sendMessage: (
    bodyFields: SlackChatMessageBodyFields,
  ) => Promise<SlackToolResult>;
};

export const sendSlackMessageWithBodyFallbacks = async ({
  messageText,
  messageBody,
  failureMessage,
  sendMessage,
}: SendSlackMessageWithBodyFallbacksParams): Promise<SlackToolResult> => {
  const messageBodies = [
    messageBody,
    ...getSlackMessageBodyFallbacks(messageBody),
  ];

  let lastError: unknown;

  for (const candidateBody of messageBodies) {
    try {
      return await sendMessage(
        getSlackChatMessageBodyFields({ messageText, ...candidateBody }),
      );
    } catch (error) {
      lastError = error;

      if (!isSlackMarkdownFormatError(error)) {
        break;
      }
    }
  }

  return slackToolFailure(failureMessage, lastError);
};
