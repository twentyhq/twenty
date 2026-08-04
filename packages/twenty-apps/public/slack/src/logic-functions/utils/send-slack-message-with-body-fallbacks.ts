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

  for (const [index, candidateBody] of messageBodies.entries()) {
    try {
      return await sendMessage(
        getSlackChatMessageBodyFields({ messageText, ...candidateBody }),
      );
    } catch (error) {
      lastError = error;

      if (
        index === messageBodies.length - 1 ||
        !isSlackMarkdownFormatError(error)
      ) {
        return slackToolFailure(failureMessage, error);
      }
    }
  }

  return slackToolFailure(failureMessage, lastError);
};
