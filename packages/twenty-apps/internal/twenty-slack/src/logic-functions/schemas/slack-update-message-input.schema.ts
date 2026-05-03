import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackUpdateMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channel: {
      type: 'string',
      description: 'Channel containing the message (ID).',
    },
    ts: {
      type: 'string',
      description:
        'Message timestamp to edit (same as slackTs returned from slack_post_message).',
    },
    text: {
      type: 'string',
      description: 'Replacement message text.',
    },
    mrkdwn: {
      type: 'boolean',
      description: 'When true, Slack parses mrkdwn in `text`.',
    },
  },
  required: ['channel', 'ts', 'text'],
  additionalProperties: false,
};
