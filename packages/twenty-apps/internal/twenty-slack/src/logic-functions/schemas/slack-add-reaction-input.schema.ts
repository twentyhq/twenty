import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackAddReactionInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channel: {
      type: 'string',
      description: 'Channel ID where the message lives.',
    },
    timestamp: {
      type: 'string',
      description: 'Message ts to react to (same format as slack_post_message slackTs).',
    },
    name: {
      type: 'string',
      description:
        'Reaction name without colons (e.g. thumbsup, eyes, white_check_mark).',
    },
  },
  required: ['channel', 'timestamp', 'name'],
  additionalProperties: false,
};
