import { type DynamicModule, Global } from '@nestjs/common';

import { CaptchaDriverFactory } from 'src/engine/core-modules/captcha/captcha-driver.factory';
import { CaptchaService } from 'src/engine/core-modules/captcha/captcha.service';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Global()
export class CaptchaModule {
  static forRoot(): DynamicModule {
    return {
      module: CaptchaModule,
      imports: [TwentyConfigModule, SecureHttpClientModule],
      providers: [CaptchaDriverFactory, CaptchaService],
      exports: [CaptchaService],
    };
  }
}
