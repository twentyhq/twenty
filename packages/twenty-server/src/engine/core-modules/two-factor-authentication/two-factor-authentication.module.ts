import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';

import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { TwoFactorAuthenticationMethodEntity } from './entities/two-factor-authentication-method.entity';
import { SimpleSecretEncryptionUtil } from './utils/simple-secret-encryption.util';

@Module({
  imports: [
    UserWorkspaceModule,
    WorkspaceDomainsModule,
    MetricsModule,
    TokenModule,
    JwtModule,
    TypeOrmModule.forFeature([
      UserEntity,
      TwoFactorAuthenticationMethodEntity,
      UserWorkspaceEntity,
    ]),
    UserModule,
  ],
  providers: [
    TwoFactorAuthenticationService,
    TwoFactorAuthenticationResolver,
    SimpleSecretEncryptionUtil,
  ],
  exports: [TwoFactorAuthenticationService],
})
export class TwoFactorAuthenticationModule {}
