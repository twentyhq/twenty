import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

type SlackChatMessageBodyFields =
  | { markdown_text: string; text?: never; mrkdwn?: never }
  | { text: string; markdown_text?: never; mrkdwn?: boolean };

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
