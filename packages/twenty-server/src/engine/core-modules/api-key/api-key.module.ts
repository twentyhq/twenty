import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyResolver } from 'src/engine/core-modules/api-key/api-key.resolver';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { ApiKeyController } from './controllers/api-key.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ApiKey, RoleTargetsEntity, RoleEntity, Workspace],
      'core',
    ),
    JwtModule,
    TokenModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheStorageModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  providers: [ApiKeyService, ApiKeyResolver, ApiKeyRoleService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService, ApiKeyRoleService, TypeOrmModule],
})
export class ApiKeyModule {}
