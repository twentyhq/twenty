import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum GettingStartedExceptionCode {
  MAILBOX_NOT_CONNECTED = 'MAILBOX_NOT_CONNECTED',
  MAILBOX_NOT_USABLE = 'MAILBOX_NOT_USABLE',
  INVALID_STEP = 'INVALID_STEP',
}

const getGettingStartedExceptionUserFriendlyMessage = (
  code: GettingStartedExceptionCode,
) => {
  switch (code) {
    case GettingStartedExceptionCode.MAILBOX_NOT_CONNECTED:
      return msg`Connect a mailbox before turning on this workflow.`;
    case GettingStartedExceptionCode.MAILBOX_NOT_USABLE:
      return msg`This workflow uses a mailbox you cannot use. Edit the draft and choose one of your own mailboxes.`;
    case GettingStartedExceptionCode.INVALID_STEP:
      return msg`This step has no workflow.`;
    default:
      assertUnreachable(code);
  }
};

export class GettingStartedException extends CustomException<GettingStartedExceptionCode> {
  constructor(
    message: string,
    code: GettingStartedExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getGettingStartedExceptionUserFriendlyMessage(code),
    });
  }
}
