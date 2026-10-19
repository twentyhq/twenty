import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum GettingStartedExceptionCode {
  MAILBOX_NOT_CONNECTED = 'MAILBOX_NOT_CONNECTED',
}

const getGettingStartedExceptionUserFriendlyMessage = (
  code: GettingStartedExceptionCode,
) => {
  switch (code) {
    case GettingStartedExceptionCode.MAILBOX_NOT_CONNECTED:
      return msg`Connect a mailbox before preparing this workflow.`;
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
