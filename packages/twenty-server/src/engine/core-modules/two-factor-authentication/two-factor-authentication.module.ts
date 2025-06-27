import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

import { TwoFactorMethod } from './entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationService } from './services/two-factor-authentication.service';
import { UserWorkspaceModule } from '../user-workspace/user-workspace.module';
import { User } from '../user/user.entity';
import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';
import { DomainManagerModule } from '../domain-manager/domain-manager.module';
import { MetricsModule } from '../metrics/metrics.module';
import { TokenModule } from '../auth/token/token.module';

@Module({
  imports: [
    UserWorkspaceModule,
    DomainManagerModule,
    MetricsModule,
    TokenModule,
    TypeOrmModule.forFeature(
      [
        User,
        TwoFactorMethod, 
        UserWorkspace
      ], 
      'core'
    )
  ],
  providers: [
    TwoFactorAuthenticationService,
    TwoFactorAuthenticationResolver
  ],
  exports: [TwoFactorAuthenticationService],
})
export class TwoFactorMethodModule {}
