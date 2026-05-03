export type SlackUpdateMessageInput = {
  slack_channel_id: string;
  message_timestamp: string;
  new_message_text: string;
  use_slack_markdown?: boolean;
};
