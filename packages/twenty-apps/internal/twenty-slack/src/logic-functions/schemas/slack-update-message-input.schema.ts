import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackUpdateMessageInputSchema: InputJsonSchema = {
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
        'Which message to edit: its **timestamp** from Slack (same value as `slackTs` returned when the bot posted the message). You cannot edit other people’s messages—only ones this bot sent.',
    },
    newMessageText: {
      type: 'string',
      description:
        'Replacement text shown in Slack instead of the old content.',
    },
    messageFormat: {
      type: 'string',
      enum: ['plain', 'markdown'],
      description:
        'Optional. Same as **Send Slack Message**: `markdown` → `markdown_text`, `plain` → plain `text` without markup, omit → Slack default on `text`.',
    },
  },
  required: ['slackChannelId', 'messageTimestamp', 'newMessageText'],
  additionalProperties: false,
};
