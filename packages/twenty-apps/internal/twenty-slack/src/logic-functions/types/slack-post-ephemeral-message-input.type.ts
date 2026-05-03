export type SlackPostEphemeralMessageInput = {
  slack_channel_id: string;
  recipient_slack_user_id: string;
  message_text: string;
  use_slack_markdown?: boolean;
};
