import { CaptchaDriverType } from '~/generated-metadata/graphql';

// Kept under the provider limits (120s reCAPTCHA, 300s Turnstile) to cover the round trip
export const CAPTCHA_TOKEN_MAX_AGE_IN_MS: Record<CaptchaDriverType, number> = {
  [CaptchaDriverType.GOOGLE_RECAPTCHA]: 100 * 1000,
  [CaptchaDriverType.TURNSTILE]: 270 * 1000,
};
