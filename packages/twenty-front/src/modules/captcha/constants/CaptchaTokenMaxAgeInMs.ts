import { CaptchaDriverType } from '~/generated-metadata/graphql';

// Providers reject tokens after 120s (reCAPTCHA) and 300s (Turnstile);
// the margin covers the round trip to our server and to the provider.
export const CAPTCHA_TOKEN_MAX_AGE_IN_MS: Record<CaptchaDriverType, number> = {
  [CaptchaDriverType.GOOGLE_RECAPTCHA]: 100 * 1000,
  [CaptchaDriverType.TURNSTILE]: 270 * 1000,
};
