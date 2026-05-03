export type SlackPostMessageInput = {
  slack_channel_id: string;
  message_text: string;
  parent_message_timestamp?: string;
  use_slack_markdown?: boolean;
};
