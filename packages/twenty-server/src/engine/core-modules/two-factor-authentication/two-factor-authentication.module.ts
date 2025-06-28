import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';

import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';

import { TwoFactorAuthenticationService } from './services/two-factor-authentication.service';
import { TwoFactorMethod } from './entities/two-factor-authentication-method.entity';

@Module({
  imports: [
    UserWorkspaceModule,
    DomainManagerModule,
    MetricsModule,
    TokenModule,
    TypeOrmModule.forFeature([User, TwoFactorMethod, UserWorkspace], 'core'),
  ],
  providers: [TwoFactorAuthenticationService, TwoFactorAuthenticationResolver],
  exports: [TwoFactorAuthenticationService],
})
export class TwoFactorMethodModule {}
