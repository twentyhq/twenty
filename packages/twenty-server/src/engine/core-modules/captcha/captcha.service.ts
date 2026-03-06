import { Inject, Injectable } from '@nestjs/common';

import { CaptchaDriver } from 'src/engine/core-modules/captcha/drivers/interfaces/captcha-driver.interface';

import { CAPTCHA_DRIVER } from 'src/engine/core-modules/captcha/constants/captcha-driver.constants';
import { type CaptchaValidateResult } from 'src/engine/core-modules/captcha/interfaces';

@Injectable()
export class CaptchaService implements CaptchaDriver {
  constructor(@Inject(CAPTCHA_DRIVER) private driver: CaptchaDriver) {}

  async validate(token: string): Promise<CaptchaValidateResult> {
    if (this.driver) {
      return await this.driver.validate(token);
    } else {
      return {
        success: true,
      };
    }
  }
}
