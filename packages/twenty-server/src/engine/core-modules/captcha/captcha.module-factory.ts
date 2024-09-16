import {
  CaptchaDriverOptions,
  CaptchaModuleOptions,
} from 'src/engine/core-modules/captcha/interfaces';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export const captchaModuleFactory = (
  environmentService: EnvironmentService,
): CaptchaModuleOptions | undefined => {
  const driver = environmentService.get('CAPTCHA_DRIVER');
  const siteKey = environmentService.get('CAPTCHA_SITE_KEY');
  const secretKey = environmentService.get('CAPTCHA_SECRET_KEY');

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
