import { isNonEmptyArray } from '@sniptt/guards';

import { type SlackChatMessageBodyFields } from 'src/logic-functions/types/slack-chat-message-body-fields.type';
import { type SlackMessageBody } from 'src/logic-functions/types/slack-message-body.type';

export const getSlackChatMessageBodyFields = ({
  messageText,
  messageFormat,
  messageBlocks,
}: { messageText: string } & SlackMessageBody): SlackChatMessageBodyFields => {
  if (isNonEmptyArray(messageBlocks)) {
    return { blocks: messageBlocks, text: messageText };
  }

  switch (messageFormat) {
    case 'markdown':
      return { markdown_text: messageText };
    case 'plain':
      return { text: messageText, mrkdwn: false };
    default:
      return { text: messageText };
  }
};
