import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackDeleteMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slackChannelId: {
      type: 'string',
      description:
        'Channel that contains the message (Slack channel ID like C…).',
    },
    messageTimestamp: {
      type: 'string',
      description:
        'Which message to remove: its **timestamp** from Slack (same value as `slackTs` when the bot posted it). Only messages sent by this bot can be deleted.',
    },
  },
  required: ['slackChannelId', 'messageTimestamp'],
  additionalProperties: false,
};
