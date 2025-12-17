import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ThrottlerExceptionCode {
  LIMIT_REACHED = 'LIMIT_REACHED',
}

const throttlerExceptionUserFriendlyMessages: Record<
  ThrottlerExceptionCode,
  MessageDescriptor
> = {
  [ThrottlerExceptionCode.LIMIT_REACHED]: msg`Rate limit reached. Please try again later.`,
};

export class ThrottlerException extends CustomException<ThrottlerExceptionCode> {
  constructor(
    message: string,
    code: ThrottlerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? throttlerExceptionUserFriendlyMessages[code],
    });
  }
}
