import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackAddReactionInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slack_channel_id: {
      type: 'string',
      description:
        'Channel where the message lives (Slack channel ID like C…).',
    },
    message_timestamp: {
      type: 'string',
      description:
        'The message to react to: use the **timestamp** from Slack (same value as `slackTs` after posting, or visible in “Copy link” URLs as the last number).',
    },
    emoji_name: {
      type: 'string',
      description:
        'Emoji to add, **without** colons — for example `thumbsup`, `eyes`, or `white_check_mark`. Do not paste `:thumbsup:` style names.',
    },
  },
  required: ['slack_channel_id', 'message_timestamp', 'emoji_name'],
  additionalProperties: false,
};
