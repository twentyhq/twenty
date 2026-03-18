import { Injectable } from '@nestjs/common';

import { CaptchaDriverFactory } from 'src/engine/core-modules/captcha/captcha-driver.factory';
import { type CaptchaDriver } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-driver.interface';
import { type CaptchaValidateResult } from 'src/engine/core-modules/captcha/interfaces';

@Injectable()
export class CaptchaService implements CaptchaDriver {
  constructor(private readonly captchaDriverFactory: CaptchaDriverFactory) {}

  async validate(token: string): Promise<CaptchaValidateResult> {
    const driver = this.captchaDriverFactory.getCurrentDriver();

    if (!driver) {
      return { success: true };
    }

    return driver.validate(token);
  }
}
