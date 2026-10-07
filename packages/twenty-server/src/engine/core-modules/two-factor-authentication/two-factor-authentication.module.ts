import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { TwoFactorAuthenticationRecoveryService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-recovery.service';
import { UserSessionModule } from 'src/engine/core-modules/user-session/user-session.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { TwoFactorAuthenticationMethodEntity } from './entities/two-factor-authentication-method.entity';

@Module({
  imports: [
    UserWorkspaceModule,
    WorkspaceDomainsModule,
    TokenModule,
    SecretEncryptionModule,
    ThrottlerModule,
    UserSessionModule,
    PermissionsModule,
    TypeOrmModule.forFeature([
      TwoFactorAuthenticationMethodEntity,
      AppTokenEntity,
    ]),
    UserModule,
  ],
  providers: [
    TwoFactorAuthenticationService,
    TwoFactorAuthenticationRecoveryService,
    TwoFactorAuthenticationResolver,
    provideWorkspaceScopedRepository(TwoFactorAuthenticationMethodEntity),
  ],
  exports: [
    TwoFactorAuthenticationService,
    TwoFactorAuthenticationRecoveryService,
  ],
})
export class TwoFactorAuthenticationModule {}
