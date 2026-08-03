export type SlackChatMessageBodyFields =
  | { markdown_text: string; text?: never; mrkdwn?: never }
  | { text: string; markdown_text?: never; mrkdwn?: boolean };
