import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { KeyWrappingModule } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.module';
import { keyWrappingConfigFactory } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.module-factory';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';

import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';

@Module({
  imports: [
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
      inject: [],
    }),
    UserModule,
  ],
  providers: [TwoFactorAuthenticationService, TwoFactorAuthenticationResolver],
  exports: [TwoFactorAuthenticationService],
})
export class TwoFactorAuthenticationModule {}
