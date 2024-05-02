import { CaptchaValidateResult } from 'src/engine/integrations/captcha/interfaces';

export interface CaptchaDriver {
  validate(token: string): Promise<CaptchaValidateResult>;
}
