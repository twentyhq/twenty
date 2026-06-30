import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const discordUpdateMessageInputSchema: InputJsonSchema = {
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
        'Which message to edit: its **message ID** (same value as `messageId` returned when the bot posted the message). You can only edit messages this bot sent.',
    },
    newMessageText: {
      type: 'string',
      label: 'New message',
      multiline: true,
      description:
        'Replacement text shown in Discord instead of the old content. Supports Discord-flavoured markdown. Max 2000 characters.',
    },
  },
  required: ['channelId', 'messageId', 'newMessageText'],
  additionalProperties: false,
};
