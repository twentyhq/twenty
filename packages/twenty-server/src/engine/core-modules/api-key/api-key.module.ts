import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyResolver } from 'src/engine/core-modules/api-key/api-key.resolver';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { ApiKeyController } from './controllers/api-key.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiKeyEntity,
      RoleTargetEntity,
      RoleEntity,
      WorkspaceEntity,
    ]),
    JwtModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    RoleTargetModule,
    TokenModule,
    PermissionsModule,
  ],
  providers: [ApiKeyService, ApiKeyResolver, ApiKeyRoleService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService, ApiKeyRoleService, TypeOrmModule],
})
export class ApiKeyModule {}
