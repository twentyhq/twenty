import { DynamicModule, Global, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { KeyWrappingModule } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.module';
import { keyWrappingConfigFactory } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.module-factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { TWO_FACTOR_AUTHENTICATION_STRATEGY } from './two-factor-authentication.constants';
import { TwoFactorAuthenticationModuleAsyncOptions } from './two-factor-authentication.interface';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';

import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';
import { TotpStrategy } from './strategies/totp.strategy';

@Global()
export class TwoFactorAuthenticationModule {
  static forRoot(
    options: TwoFactorAuthenticationModuleAsyncOptions,
  ): DynamicModule {
    const strategy: Provider = {
      provide: TWO_FACTOR_AUTHENTICATION_STRATEGY,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        switch (config?.type) {
          case TwoFactorAuthenticationStrategy.TOTP: {
            return new TotpStrategy(config.config);
          }
        }
      },
      inject: options.inject || [],
    };

    return {
      module: TwoFactorAuthenticationModule,
      imports: [
        KeyWrappingModule,
        UserWorkspaceModule,
        DomainManagerModule,
        MetricsModule,
        TokenModule,
        TypeOrmModule.forFeature(
          [User, TwoFactorAuthenticationMethod, UserWorkspace],
          'core',
        ),
        KeyWrappingModule.forRoot({
          useFactory: keyWrappingConfigFactory,
          inject: [TwentyConfigService],
        }),
        UserModule,
      ],
      providers: [
        TwoFactorAuthenticationService,
        TwoFactorAuthenticationResolver,
        strategy,
      ],
      exports: [TwoFactorAuthenticationService],
    };
  }
}
