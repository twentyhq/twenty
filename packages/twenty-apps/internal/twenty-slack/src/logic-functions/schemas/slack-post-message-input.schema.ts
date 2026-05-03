import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackPostMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slack_channel_id: {
      type: 'string',
      description:
        'Where to post: the Slack channel or DM ID (looks like C0123…, G… for private channels, or D… for DMs). In Slack: open the channel → channel name → scroll down → copy Channel ID. Using the ID is more reliable than a channel name.',
    },
    message_text: {
      type: 'string',
      description:
        'The message people will read in Slack. Keep it concise; very long messages may be rejected by Slack.',
    },
    parent_message_timestamp: {
      type: 'string',
      description:
        'Optional. Only when you want a **thread reply**: paste the **Message timestamp** from an earlier Slack step (the value returned as `slackTs` after posting). Leave empty for a normal new message at the bottom of the channel.',
    },
    use_slack_markdown: {
      type: 'boolean',
      description:
        'Optional. Turn on Slack’s lightweight formatting in `message_text` (*bold*, _italic_, <https://…|links>, etc.). Leave off for plain text.',
    },
  },
  required: ['slack_channel_id', 'message_text'],
  additionalProperties: false,
};
