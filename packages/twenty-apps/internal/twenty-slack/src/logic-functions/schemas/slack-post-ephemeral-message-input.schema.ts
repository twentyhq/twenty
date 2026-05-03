import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackPostEphemeralMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channel: {
      type: 'string',
      description:
        'Channel ID where the ephemeral message appears (user must be a member).',
    },
    user: {
      type: 'string',
      description: 'Slack user ID (U…) who will see the ephemeral message.',
    },
    text: {
      type: 'string',
      description: 'Ephemeral message body.',
    },
    mrkdwn: {
      type: 'boolean',
      description: 'When true, Slack parses mrkdwn in `text`.',
    },
  },
  required: ['channel', 'user', 'text'],
  additionalProperties: false,
};
