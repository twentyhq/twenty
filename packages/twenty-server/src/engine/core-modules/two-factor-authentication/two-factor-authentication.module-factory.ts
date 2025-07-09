import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationModuleOptions } from './two-factor-authentication.interface';
import { HOTPStrategyConfig } from './strategies/hotp.strategy';
import { TOTPStrategyConfig } from './strategies/totp.strategy';
import { TwoFactorAuthenticationException, TwoFactorAuthenticationExceptionCode } from './two-factor-authentication.exception';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

export const twoFactorAuthenticationModuleFactory = (twentyConfigService: TwentyConfigService): TwoFactorAuthenticationModuleOptions => {
  const strategy = twentyConfigService.get('TWO_FACTOR_AUTHENTICATION_STRATEGY');
  const hotpConfig: HOTPStrategyConfig = {
    algorithm: twentyConfigService.get('OTP_HASH_ALGORITHM'),
    digits: twentyConfigService.get('OTP_DIGITS'),
    encodings: twentyConfigService.get('OTP_SECRET_ENCODING'),
    window: twentyConfigService.get('OTP_WINDOW')
  }

  switch (strategy) {
    case TwoFactorAuthenticationStrategy.HOTP: {
      return { 
        type: TwoFactorAuthenticationStrategy.HOTP,
        config: hotpConfig
      };
    }

    case TwoFactorAuthenticationStrategy.TOTP: {
      const config: TOTPStrategyConfig = {
        ...hotpConfig,
        step: twentyConfigService.get('TOTP_STEP_SIZE')
      }

      return { 
        type: TwoFactorAuthenticationStrategy.TOTP,
        config
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
