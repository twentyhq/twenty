import { type TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import { type OTPContext } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';

export interface OTPAuthenticationStrategyInterface {
  readonly name: TwoFactorAuthenticationStrategy;
  initiate(
    accountName: string,
    issuer: string,
  ): {
    uri: string;
    context: OTPContext;
  };
  validate(
    token: string,
    context: OTPContext,
  ): {
    isValid: boolean;
    context: OTPContext;
  };
}
