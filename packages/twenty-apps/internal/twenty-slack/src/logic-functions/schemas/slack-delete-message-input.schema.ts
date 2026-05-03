import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackDeleteMessageInputSchema: InputJsonSchema = {
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
        'Which message to remove: its **timestamp** from Slack (same value as `slackTs` when the bot posted it). Only messages sent by this bot can be deleted.',
    },
  },
  required: ['slack_channel_id', 'message_timestamp'],
  additionalProperties: false,
};
