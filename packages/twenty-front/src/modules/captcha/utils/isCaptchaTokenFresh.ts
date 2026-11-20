import { CAPTCHA_TOKEN_MAX_AGE_IN_MS } from '@/captcha/constants/CaptchaTokenMaxAgeInMs';
import { type CaptchaToken } from '@/captcha/types/CaptchaToken';
import { type CaptchaDriverType } from '~/generated-metadata/graphql';

export const isCaptchaTokenFresh = ({
  captchaToken,
  provider,
  now,
}: {
  captchaToken: Pick<CaptchaToken, 'issuedAt'>;
  provider: CaptchaDriverType;
  now: number;
}): boolean =>
  now - captchaToken.issuedAt < CAPTCHA_TOKEN_MAX_AGE_IN_MS[provider];
