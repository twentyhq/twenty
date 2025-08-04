import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddNextStepIdsToWorkflowRunsTrigger } from 'src/database/commands/upgrade-version-command/1-3/1-3-add-next-step-ids-to-workflow-runs-trigger.command';
import { AssignRolesToExistingApiKeysCommand } from 'src/database/commands/upgrade-version-command/1-3/1-3-assign-roles-to-existing-api-keys.command';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Workspace,
        ApiKey,
        FieldMetadataEntity,
        ObjectMetadataEntity,
        RoleEntity,
        RoleTargetsEntity,
      ],
      'core',
    ),
    WorkspaceDataSourceModule,
    ApiKeyModule,
    FeatureFlagModule,
    TwentyORMModule,
    RoleModule,
    WorkspacePermissionsCacheModule,
    WorkspaceFeatureFlagsMapCacheModule,
  ],
  providers: [
    AssignRolesToExistingApiKeysCommand,
    AddNextStepIdsToWorkflowRunsTrigger,
  ],
  exports: [
    AssignRolesToExistingApiKeysCommand,
    AddNextStepIdsToWorkflowRunsTrigger,
  ],
})
export class V1_3_UpgradeVersionCommandModule {}
