import {
  type CaptchaDriverOptions,
  type CaptchaModuleOptions,
} from 'src/engine/core-modules/captcha/interfaces';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const captchaModuleFactory = (
  twentyConfigService: TwentyConfigService,
): CaptchaModuleOptions | undefined => {
  const driver = twentyConfigService.get('CAPTCHA_DRIVER');
  const siteKey = twentyConfigService.get('CAPTCHA_SITE_KEY');
  const secretKey = twentyConfigService.get('CAPTCHA_SECRET_KEY');

  if (!driver) {
    return;
  }

  if (!siteKey || !secretKey) {
    throw new Error('Captcha driver requires site key and secret key');
  }

  const captchaOptions: CaptchaDriverOptions = {
    siteKey,
    secretKey,
  };

  return {
    type: driver,
    options: captchaOptions,
  };
};
