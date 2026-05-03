export type SlackPostEphemeralMessageInput = {
  channel: string;
  user: string;
  text: string;
  mrkdwn?: boolean;
};
