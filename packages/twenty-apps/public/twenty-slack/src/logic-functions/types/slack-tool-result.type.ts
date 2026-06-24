export type SlackToolResult = {
  success: boolean;
  message: string;
  error?: string;
  slackTs?: string;
  channel?: string;
};
