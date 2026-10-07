import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const PendingWakeUpExceptionCode = appendCommonExceptionCode({
  OWNER_HANDLER_NOT_REGISTERED: 'OWNER_HANDLER_NOT_REGISTERED',
} as const);

const getPendingWakeUpExceptionUserFriendlyMessage = (
  code: keyof typeof PendingWakeUpExceptionCode,
) => {
  switch (code) {
    case PendingWakeUpExceptionCode.OWNER_HANDLER_NOT_REGISTERED:
    case PendingWakeUpExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`Something went wrong. Please try again.`;
    default:
      assertUnreachable(code);
  }
};

export class PendingWakeUpException extends CustomException<
  keyof typeof PendingWakeUpExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof PendingWakeUpExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getPendingWakeUpExceptionUserFriendlyMessage(code),
    });
  }
}
