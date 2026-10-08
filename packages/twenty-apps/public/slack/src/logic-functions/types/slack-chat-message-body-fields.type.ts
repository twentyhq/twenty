import { type KnownBlock } from '@slack/web-api';

export type SlackChatMessageBodyFields =
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
