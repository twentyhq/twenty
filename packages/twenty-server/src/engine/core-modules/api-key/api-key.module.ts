import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyResolver } from 'src/engine/core-modules/api-key/api-key.resolver';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ApiKey, RoleTargetsEntity, RoleEntity, Workspace],
      'core',
    ),
    JwtModule,
    WorkspacePermissionsCacheModule,
  ],
  providers: [ApiKeyService, ApiKeyResolver, ApiKeyRoleService],
  exports: [ApiKeyService, ApiKeyRoleService, TypeOrmModule],
})
export class ApiKeyModule {}
