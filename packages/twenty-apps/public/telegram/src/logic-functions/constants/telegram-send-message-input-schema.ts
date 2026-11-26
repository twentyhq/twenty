import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-plain-message-max-length';

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
      description: `The message text, sent as plain text in a direct message from the bot. At most ${TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH} characters.`,
    },
  },
  required: ['workspaceMemberId', 'text'],
  additionalProperties: false,
};
