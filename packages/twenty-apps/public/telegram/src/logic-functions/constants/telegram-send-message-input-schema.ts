import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const TELEGRAM_SEND_MESSAGE_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    workspaceMemberId: {
      type: 'string',
      label: 'Workspace member ID',
      description:
        'ID of the workspace member to message. The member must have connected their Telegram account to Twenty.',
    },
    text: {
      type: 'string',
      label: 'Message',
      multiline: true,
      description:
        'The message text, sent as plain text in a direct message from the bot. At most 4096 characters.',
    },
  },
  required: ['workspaceMemberId', 'text'],
  additionalProperties: false,
};
