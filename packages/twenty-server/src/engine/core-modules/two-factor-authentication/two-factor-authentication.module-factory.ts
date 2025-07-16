import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { TwoFactorAuthenticationModuleOptions } from './two-factor-authentication.interface';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';

import { HOTP_DEFAULT_CONFIGURATON } from './strategies/constants/hotp.stratey.constants';
import { TOT_DEFAULT_CONFIGURATION } from './strategies/constants/totp.strategy.constants';

export const twoFactorAuthenticationModuleFactory = (
  twentyConfigService: TwentyConfigService,
): TwoFactorAuthenticationModuleOptions => {
  const strategy = twentyConfigService.get(
    'TWO_FACTOR_AUTHENTICATION_STRATEGY',
  );

  switch (strategy) {
    case TwoFactorAuthenticationStrategy.HOTP: {
      return {
        type: TwoFactorAuthenticationStrategy.HOTP,
        config: HOTP_DEFAULT_CONFIGURATON,
      };
    }

    case TwoFactorAuthenticationStrategy.TOTP: {
      return {
        type: TwoFactorAuthenticationStrategy.TOTP,
        config: TOT_DEFAULT_CONFIGURATION,
      };
    }

    default: {
      throw new TwoFactorAuthenticationException(
        'Unsupported strategy.',
        TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
      );
    }
  }
};
