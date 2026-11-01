import { TOTP_DEFAULT_CONFIGURATION } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/totp/constants/totp.strategy.constants';

export const TWO_FACTOR_AUTHENTICATION_USED_OTP_TTL_MS =
  (2 * TOTP_DEFAULT_CONFIGURATION.window + 2) *
  TOTP_DEFAULT_CONFIGURATION.step *
  1000;
