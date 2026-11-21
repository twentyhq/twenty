import { CAPTCHA_TOKEN_MAX_AGE_IN_MS } from '@/captcha/constants/CaptchaTokenMaxAgeInMs';
import { isCaptchaTokenFresh } from '@/captcha/utils/isCaptchaTokenFresh';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

describe('isCaptchaTokenFresh', () => {
  const captchaToken = { token: 'token', issuedAt: 1_000_000 };

  it.each([CaptchaDriverType.GOOGLE_RECAPTCHA, CaptchaDriverType.TURNSTILE])(
    'should accept a %s token until it reaches the provider max age',
    (provider) => {
      const maxAge = CAPTCHA_TOKEN_MAX_AGE_IN_MS[provider];

      expect(
        isCaptchaTokenFresh({
          captchaToken,
          provider,
          now: captchaToken.issuedAt + maxAge - 1,
        }),
      ).toBe(true);
      expect(
        isCaptchaTokenFresh({
          captchaToken,
          provider,
          now: captchaToken.issuedAt + maxAge,
        }),
      ).toBe(false);
    },
  );
});
