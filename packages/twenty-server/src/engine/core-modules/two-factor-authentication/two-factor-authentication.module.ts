import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
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
    TypeOrmModule.forFeature([TwoFactorAuthenticationMethodEntity]),
    UserModule,
  ],
  providers: [
    TwoFactorAuthenticationService,
    TwoFactorAuthenticationResolver,
    provideWorkspaceScopedRepository(TwoFactorAuthenticationMethodEntity),
  ],
  exports: [TwoFactorAuthenticationService],
})
export class TwoFactorAuthenticationModule {}
