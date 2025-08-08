import { type DynamicModule, Global } from '@nestjs/common';

import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { CAPTCHA_DRIVER } from 'src/engine/core-modules/captcha/constants/captcha-driver.constants';
import { GoogleRecaptchaDriver } from 'src/engine/core-modules/captcha/drivers/google-recaptcha.driver';
import { TurnstileDriver } from 'src/engine/core-modules/captcha/drivers/turnstile.driver';
import {
  CaptchaDriverType,
  type CaptchaModuleAsyncOptions,
} from 'src/engine/core-modules/captcha/interfaces';

@Global()
export class CaptchaModule {
  static forRoot(options: CaptchaModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: CAPTCHA_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        if (!config) {
          return;
        }

        switch (config.type) {
          case CaptchaDriverType.GOOGLE_RECAPTCHA:
            return new GoogleRecaptchaDriver(config.options);
          case CaptchaDriverType.TURNSTILE:
            return new TurnstileDriver(config.options);
          default:
            return;
        }
      },
      inject: options.inject || [],
    };

    return {
      module: CaptchaModule,
      providers: [CaptchaService, provider],
      exports: [CaptchaService],
    };
  }
}
