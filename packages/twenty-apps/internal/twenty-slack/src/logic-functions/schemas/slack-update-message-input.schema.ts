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
      description: 'Replacement text shown in Slack instead of the old content.',
    },
    useSlackMarkdown: {
      type: 'boolean',
      description:
        'Optional. Use Slack’s simple formatting in the new text (*bold*, links, etc.).',
    },
  },
  required: ['slackChannelId', 'messageTimestamp', 'newMessageText'],
  additionalProperties: false,
};
