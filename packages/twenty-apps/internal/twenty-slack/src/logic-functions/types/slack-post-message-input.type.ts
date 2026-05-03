export type SlackPostMessageInput = {
  channel: string;
  text: string;
  thread_ts?: string;
  mrkdwn?: boolean;
};
