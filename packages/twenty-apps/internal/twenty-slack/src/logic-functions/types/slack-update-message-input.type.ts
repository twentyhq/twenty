export type SlackUpdateMessageInput = {
  channel: string;
  ts: string;
  text: string;
  mrkdwn?: boolean;
};
