import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CaptchaExceptionCode {
  INVALID_CAPTCHA = 'INVALID_CAPTCHA',
}

const getCaptchaExceptionUserFriendlyMessage = (code: CaptchaExceptionCode) => {
  switch (code) {
    case CaptchaExceptionCode.INVALID_CAPTCHA:
      return msg`Invalid captcha. Please try again.`;
    default:
      assertUnreachable(code);
  }
};

export class CaptchaException extends CustomException<CaptchaExceptionCode> {
  constructor(
    message: string,
    code: CaptchaExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getCaptchaExceptionUserFriendlyMessage(code),
    });
  }
}
