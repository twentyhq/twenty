import { CaptchaDriverType } from '~/generated-metadata/graphql';

export const getCaptchaUrlByProvider = (name: string, siteKey: string) => {
  if (!name) {
    return '';
  }

  switch (name) {
    case CaptchaDriverType.GoogleRecatpcha:
      return `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    case CaptchaDriverType.HCaptcha:
      return 'https://js.hcaptcha.com/1/api.js';
    case CaptchaDriverType.Turnstile:
      return 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    default:
      return '';
  }
};
