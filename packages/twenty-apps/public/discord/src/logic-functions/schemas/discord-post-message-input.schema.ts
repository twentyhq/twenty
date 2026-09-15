import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const discordPostMessageInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    channelId: {
      type: 'string',
      label: 'Discord channel ID',
      description:
        'Where to post: the Discord channel ID (a long number like `1234567890123456789`). In Discord with Developer Mode on: right-click the channel → "Copy Channel ID". The bot must be a member of the server and have permission to send messages in this channel.',
    },
    messageText: {
      type: 'string',
      label: 'Message',
      multiline: true,
      description:
        'The message text. Supports Discord-flavoured markdown (**bold**, *italics*, ```code blocks```, lists, links). Max 2000 characters — Discord rejects longer payloads.',
    },
    replyToMessageId: {
      type: 'string',
      label: 'Reply to message ID',
      description:
        'Optional. To reply to an existing message, paste its ID (from a previous step\'s `messageId` output, or right-click the message → "Copy Message ID"). Leave empty for a normal new message.',
    },
  },
  required: ['channelId', 'messageText'],
  additionalProperties: false,
};
