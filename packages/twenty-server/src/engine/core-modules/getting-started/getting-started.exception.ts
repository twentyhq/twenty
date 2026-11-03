import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum GettingStartedExceptionCode {
  INVALID_STEP = 'INVALID_STEP',
  HIDE_NOT_ALLOWED = 'HIDE_NOT_ALLOWED',
}

const getGettingStartedExceptionUserFriendlyMessage = (
  code: GettingStartedExceptionCode,
) => {
  switch (code) {
    case GettingStartedExceptionCode.INVALID_STEP:
      return msg`This step has no workflow.`;
    case GettingStartedExceptionCode.HIDE_NOT_ALLOWED:
      return msg`Add a payment method to hide Getting started for good.`;
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
