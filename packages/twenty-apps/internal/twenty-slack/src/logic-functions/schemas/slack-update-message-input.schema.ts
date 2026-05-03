import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackUpdateMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slack_channel_id: {
      type: 'string',
      description:
        'Channel that contains the message (Slack channel ID like C…).',
    },
    message_timestamp: {
      type: 'string',
      description:
        'Which message to edit: its **timestamp** from Slack (same value as `slackTs` returned when the bot posted the message). You cannot edit other people’s messages—only ones this bot sent.',
    },
    new_message_text: {
      type: 'string',
      description: 'Replacement text shown in Slack instead of the old content.',
    },
    use_slack_markdown: {
      type: 'boolean',
      description:
        'Optional. Use Slack’s simple formatting in the new text (*bold*, links, etc.).',
    },
  },
  required: ['slack_channel_id', 'message_timestamp', 'new_message_text'],
  additionalProperties: false,
};
