import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { TwoFactorAuthenticationRecoveryService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-recovery.service';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { TwoFactorAuthenticationMethodEntity } from './entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationRecoveryCodeEntity } from './entities/two-factor-authentication-recovery-code.entity';

@Module({
  imports: [
    UserWorkspaceModule,
    WorkspaceDomainsModule,
    MetricsModule,
    TokenModule,
    SecretEncryptionModule,
    ThrottlerModule,
    EventLogEmitterModule,
    FeatureFlagModule,
    UserSessionModule,
    PermissionsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      TwoFactorAuthenticationMethodEntity,
      TwoFactorAuthenticationRecoveryCodeEntity,
      UserWorkspaceEntity,
      AppTokenEntity,
    ]),
    UserModule,
  ],
  providers: [
    TwoFactorAuthenticationService,
    TwoFactorAuthenticationRecoveryService,
    TwoFactorAuthenticationResolver,
    provideWorkspaceScopedRepository(TwoFactorAuthenticationMethodEntity),
    provideWorkspaceScopedRepository(TwoFactorAuthenticationRecoveryCodeEntity),
  ],
  exports: [
    TwoFactorAuthenticationService,
    TwoFactorAuthenticationRecoveryService,
  ],
})
export class TwoFactorAuthenticationModule {}
