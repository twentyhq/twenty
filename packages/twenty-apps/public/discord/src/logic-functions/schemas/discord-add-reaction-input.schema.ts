import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const discordAddReactionInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channelId: {
      type: 'string',
      label: 'Discord channel ID',
      description: 'Channel where the message lives (Discord channel ID).',
    },
    messageId: {
      type: 'string',
      label: 'Message ID',
      description:
        'The message to react to: its **message ID** (same value as `messageId` returned when the bot posted it, or right-click the message → "Copy Message ID").',
    },
    emoji: {
      type: 'string',
      label: 'Emoji',
      description:
        'Emoji to add. For a standard unicode emoji, paste the emoji directly (e.g. `👍`, `✅`, `🎉`). For a custom server emoji, use the format `name:id` (e.g. `partyparrot:643452342342342342`). The bot must have **Add Reactions** permission in the channel.',
    },
  },
  required: ['channelId', 'messageId', 'emoji'],
  additionalProperties: false,
};
