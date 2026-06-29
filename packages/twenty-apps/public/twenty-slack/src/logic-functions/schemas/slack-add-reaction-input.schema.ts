import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackAddReactionInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slackChannelId: {
      type: 'string',
      label: 'Slack channel (name or ID)',
      description:
        'Channel where the message lives (Slack channel ID like C…).',
    },
    messageTimestamp: {
      type: 'string',
      label: 'Message timestamp',
      description:
        'The message to react to: use the **timestamp** from Slack (same value as `slackTs` after posting, or visible in “Copy link” URLs as the last number).',
    },
    emojiName: {
      type: 'string',
      label: 'Emoji name',
      description:
        'Emoji to add, **without** colons — for example `thumbsup`, `eyes`, or `white_check_mark`. Do not paste `:thumbsup:` style names.',
    },
  },
  required: ['slackChannelId', 'messageTimestamp', 'emojiName'],
  additionalProperties: false,
};
