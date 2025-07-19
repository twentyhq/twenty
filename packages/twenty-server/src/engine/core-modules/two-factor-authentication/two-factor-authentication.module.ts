import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { keyWrappingConfigFactory } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.module-factory';
import { KeyWrappingModule } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';

import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';

@Module({
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
  providers: [TwoFactorAuthenticationService, TwoFactorAuthenticationResolver],
  exports: [TwoFactorAuthenticationService],
})
export class TwoFactorAuthenticationModule {}
