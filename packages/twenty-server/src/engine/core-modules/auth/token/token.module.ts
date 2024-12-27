/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { RenewTokenService } from 'src/engine/core-modules/auth/token/services/renew-token.service';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([User, AppToken, Workspace], 'core'),
    TypeORMModule,
    DataSourceModule,
    EmailModule,
    WorkspaceSSOModule,
    UserWorkspaceModule,
  ],
  providers: [
    RenewTokenService,
    JwtAuthStrategy,
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
  ],
  exports: [
    RenewTokenService,
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
  ],
})
export class TokenModule {}
