export type SlackPostEphemeralMessageInput = {
  slackChannelId: string;
  recipientSlackUserId: string;
  messageText: string;
  useSlackMarkdown?: boolean;
};
