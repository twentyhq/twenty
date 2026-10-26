import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum GettingStartedExceptionCode {
  MAILBOX_NOT_CONNECTED = 'MAILBOX_NOT_CONNECTED',
  INVALID_STEP = 'INVALID_STEP',
}

const getGettingStartedExceptionUserFriendlyMessage = (
  code: GettingStartedExceptionCode,
) => {
  switch (code) {
    case GettingStartedExceptionCode.MAILBOX_NOT_CONNECTED:
      return msg`Connect a mailbox before preparing this workflow.`;
    case GettingStartedExceptionCode.INVALID_STEP:
      return msg`This step cannot be completed this way.`;
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
