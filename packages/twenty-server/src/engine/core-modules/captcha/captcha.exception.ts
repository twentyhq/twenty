import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum CaptchaExceptionCode {
  INVALID_CAPTCHA = 'INVALID_CAPTCHA',
}

const captchaExceptionUserFriendlyMessages: Record<
  CaptchaExceptionCode,
  MessageDescriptor
> = {
  [CaptchaExceptionCode.INVALID_CAPTCHA]: msg`Invalid captcha. Please try again.`,
};

export class CaptchaException extends CustomException<CaptchaExceptionCode> {
  constructor(
    message: string,
    code: CaptchaExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? captchaExceptionUserFriendlyMessages[code],
    });
  }
}
