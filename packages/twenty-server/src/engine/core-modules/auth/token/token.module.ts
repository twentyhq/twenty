/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { RenewTokenService } from 'src/engine/core-modules/auth/token/services/renew-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature(
      [User, AppToken, Workspace, UserWorkspace, ApiKey],
      'core',
    ),
    TypeORMModule,
    DataSourceModule,
  ],
  providers: [
    RenewTokenService,
    JwtAuthStrategy,
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
    WorkspaceAgnosticTokenService,
  ],
  exports: [
    RenewTokenService,
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
    WorkspaceAgnosticTokenService,
  ],
})
export class TokenModule {}
