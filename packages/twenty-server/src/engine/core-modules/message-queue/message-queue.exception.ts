import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageQueueExceptionCode {
  STATUS_BROADCAST_RECIPIENT_MISSING = 'STATUS_BROADCAST_RECIPIENT_MISSING',
}

const getMessageQueueExceptionUserFriendlyMessage = (
  code: MessageQueueExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case MessageQueueExceptionCode.STATUS_BROADCAST_RECIPIENT_MISSING:
      return msg`The job cannot report its status without a recipient.`;
    default:
      assertUnreachable(code);
  }
};

export class MessageQueueException extends CustomException<MessageQueueExceptionCode> {
  constructor(message: string, code: MessageQueueExceptionCode) {
    super(message, code, {
      userFriendlyMessage: getMessageQueueExceptionUserFriendlyMessage(code),
    });
  }
}
