import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageComposerExceptionCode {
  APP_MESSAGE_CHANNEL_NOT_FOUND = 'APP_MESSAGE_CHANNEL_NOT_FOUND',
  MESSAGE_CHANNEL_TYPE_NOT_SUPPORTED = 'MESSAGE_CHANNEL_TYPE_NOT_SUPPORTED',
}

const getMessageComposerExceptionUserFriendlyMessage = (
  code: MessageComposerExceptionCode,
) => {
  switch (code) {
    case MessageComposerExceptionCode.APP_MESSAGE_CHANNEL_NOT_FOUND:
      return msg`App message channel not found.`;
    case MessageComposerExceptionCode.MESSAGE_CHANNEL_TYPE_NOT_SUPPORTED:
      return msg`This message channel type does not support sending messages.`;
    default:
      assertUnreachable(code);
  }
};

export class MessageComposerException extends CustomException<MessageComposerExceptionCode> {
  constructor(message: string, code: MessageComposerExceptionCode) {
    super(message, code, {
      userFriendlyMessage: getMessageComposerExceptionUserFriendlyMessage(code),
    });
  }
}
