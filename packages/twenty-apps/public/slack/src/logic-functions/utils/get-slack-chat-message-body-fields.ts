import { type KnownBlock } from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';

import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

type SlackChatMessageBodyFields =
  | {
      blocks: KnownBlock[];
      text: string;
      markdown_text?: never;
      mrkdwn?: never;
    }
  | {
      markdown_text: string;
      blocks?: never;
      text?: never;
      mrkdwn?: never;
    }
  | {
      text: string;
      blocks?: never;
      markdown_text?: never;
      mrkdwn?: boolean;
    };

export const getSlackChatMessageBodyFields = ({
  messageText,
  messageFormat,
  messageBlocks,
}: {
  messageText: string;
  messageFormat?: SlackMessageBodyFormat;
  messageBlocks?: KnownBlock[];
}): SlackChatMessageBodyFields => {
  // Slack stops rendering `text` once `blocks` is set, but still uses it for
  // notification previews and screen readers
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
