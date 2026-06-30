import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const slackUpdateMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    slackChannelId: {
      type: 'string',
      label: 'Slack channel (name or ID)',
      description:
        'Channel that contains the message (Slack channel ID like C…).',
    },
    messageTimestamp: {
      type: 'string',
      label: 'Message timestamp',
      description:
        'Which message to edit: its **timestamp** from Slack (same value as `slackTs` returned when the bot posted the message). You cannot edit other people’s messages—only ones this bot sent.',
    },
    newMessageText: {
      type: 'string',
      label: 'New message',
      multiline: true,
      description:
        'Replacement text shown in Slack instead of the old content.',
    },
    messageFormat: {
      type: 'string',
      label: 'Message format',
      enum: ['plain', 'markdown'],
      description:
        'Optional. Same as **Send Slack Message**: `markdown` → `markdown_text`, `plain` → plain `text` without markup, omit → Slack default on `text`.',
    },
  },
  required: ['slackChannelId', 'messageTimestamp', 'newMessageText'],
  additionalProperties: false,
};
