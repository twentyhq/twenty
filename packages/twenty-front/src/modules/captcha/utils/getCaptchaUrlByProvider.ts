import { isNonEmptyString } from '@sniptt/guards';
import { t } from '@lingui/core/macro';

import { CaptchaDriverType } from '~/generated-metadata/graphql';

export const getCaptchaUrlByProvider = (
  name: CaptchaDriverType,
  siteKey: string,
) => {
  switch (name) {
    case CaptchaDriverType.GOOGLE_RECAPTCHA:
      if (!isNonEmptyString(siteKey)) {
        throw new Error(
          t`SiteKey must be provided while generating url for GoogleRecaptcha provider`,
        );
      }
      return `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    case CaptchaDriverType.TURNSTILE:
      return 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    default:
      throw new Error(t`Unknown captcha provider`);
  }
};
