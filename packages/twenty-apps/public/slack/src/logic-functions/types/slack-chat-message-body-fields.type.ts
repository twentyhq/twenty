import { type KnownBlock, type MessageAttachment } from '@slack/web-api';

export type SlackChatMessageBodyFields =
  | {
      blocks: KnownBlock[];
      text: string;
      attachments?: MessageAttachment[];
      markdown_text?: never;
      mrkdwn?: never;
    }
  | {
      markdown_text: string;
      blocks?: never;
      text?: never;
      attachments?: never;
      mrkdwn?: never;
    }
  | {
      text: string;
      blocks?: never;
      markdown_text?: never;
      attachments?: never;
      mrkdwn?: boolean;
    };
