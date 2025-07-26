import { CustomException } from 'src/utils/custom-exception';

export class CaptchaException extends CustomException {
  declare code: CaptchaExceptionCode;
  constructor(
    message: string,
    code: CaptchaExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum CaptchaExceptionCode {
  INVALID_CAPTCHA = 'INVALID_CAPTCHA',
}
