import { CustomException } from 'src/utils/custom-exception';

export class CaptchaException extends CustomException<CaptchaExceptionCode> {}

export enum CaptchaExceptionCode {
  INVALID_CAPTCHA = 'INVALID_CAPTCHA',
}
