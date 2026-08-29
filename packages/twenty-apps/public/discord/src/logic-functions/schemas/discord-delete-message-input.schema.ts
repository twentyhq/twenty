import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const discordDeleteMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channelId: {
      type: 'string',
      label: 'Discord channel ID',
      description: 'Channel that contains the message (Discord channel ID).',
    },
    messageId: {
      type: 'string',
      label: 'Message ID',
      description:
        'Which message to remove: its **message ID** (same value as `messageId` returned when the bot posted it). The bot can delete its own messages without extra permissions; deleting others\' messages requires the **Manage Messages** permission.',
    },
  },
  required: ['channelId', 'messageId'],
  additionalProperties: false,
};
