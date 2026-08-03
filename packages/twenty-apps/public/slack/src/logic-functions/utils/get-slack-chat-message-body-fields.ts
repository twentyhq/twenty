import { type SlackChatMessageBodyFields } from 'src/logic-functions/types/slack-chat-message-body-fields.type';
import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

export const getSlackChatMessageBodyFields = (
  messageText: string,
  messageFormat: SlackMessageBodyFormat | undefined,
): SlackChatMessageBodyFields => {
  switch (messageFormat) {
    case 'markdown':
      return { markdown_text: messageText };
    case 'plain':
      return { text: messageText, mrkdwn: false };
    default:
      return { text: messageText };
  }
};
