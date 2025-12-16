import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { RenewTokenService } from 'src/engine/core-modules/auth/token/services/renew-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([
      UserEntity,
      AppTokenEntity,
      WorkspaceEntity,
      UserWorkspaceEntity,
      ApiKeyEntity,
      ApplicationEntity,
    ]),
    TypeORMModule,
    DataSourceModule,
    PermissionsModule,
  ],
  providers: [
    RenewTokenService,
    JwtAuthStrategy,
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
    WorkspaceAgnosticTokenService,
    ApplicationTokenService,
  ],
  exports: [
    RenewTokenService,
    AccessTokenService,
    LoginTokenService,
    RefreshTokenService,
    WorkspaceAgnosticTokenService,
    ApplicationTokenService,
  ],
})
export class TokenModule {}
