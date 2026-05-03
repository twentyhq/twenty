import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackDeleteMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channel: {
      type: 'string',
      description: 'Channel containing the message (ID).',
    },
    ts: {
      type: 'string',
      description:
        'Message timestamp to delete (typically from slack_post_message).',
    },
  },
  required: ['channel', 'ts'],
  additionalProperties: false,
};
