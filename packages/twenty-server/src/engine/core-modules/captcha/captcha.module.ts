import { type DynamicModule, Global } from '@nestjs/common';

import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { CAPTCHA_DRIVER } from 'src/engine/core-modules/captcha/constants/captcha-driver.constants';
import { GoogleRecaptchaDriver } from 'src/engine/core-modules/captcha/drivers/google-recaptcha.driver';
import { TurnstileDriver } from 'src/engine/core-modules/captcha/drivers/turnstile.driver';
import {
  CaptchaDriverType,
  type CaptchaModuleAsyncOptions,
} from 'src/engine/core-modules/captcha/interfaces';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

@Global()
export class CaptchaModule {
  static forRoot(options: CaptchaModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: CAPTCHA_DRIVER,
      useFactory: async (
        secureHttpClientService: SecureHttpClientService,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
      ) => {
        const config = await options.useFactory(...args);

        if (!config) {
          return;
        }

        switch (config.type) {
          case CaptchaDriverType.GOOGLE_RECAPTCHA:
            return new GoogleRecaptchaDriver(
              config.options,
              secureHttpClientService.getHttpClient({
                baseURL: 'https://www.google.com/recaptcha/api/siteverify',
              }),
            );
          case CaptchaDriverType.TURNSTILE:
            return new TurnstileDriver(
              config.options,
              secureHttpClientService.getHttpClient({
                baseURL:
                  'https://challenges.cloudflare.com/turnstile/v0/siteverify',
              }),
            );
          default:
            return;
        }
      },
      inject: [SecureHttpClientService, ...(options.inject || [])],
    };

    return {
      module: CaptchaModule,
      imports: [SecureHttpClientModule],
      providers: [CaptchaService, provider],
      exports: [CaptchaService],
    };
  }
}
