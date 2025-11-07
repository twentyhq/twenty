import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CleanOrphanedRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-clean-orphaned-role-targets.command';
import { CleanOrphanedUserWorkspacesCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-clean-orphaned-user-workspaces.command';
import { MigrateTimelineActivityToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-migrate-timeline-activity-to-morph-relations.command';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
      ViewEntity,
      UserWorkspaceEntity,
      RoleTargetsEntity,
      DataSourceEntity,
    ]),
    WorkspaceSchemaManagerModule,
    FeatureFlagModule,
    WorkspaceCacheStorageModule,
    ObjectMetadataModule,
  ],
  providers: [
    CleanOrphanedUserWorkspacesCommand,
    CleanOrphanedRoleTargetsCommand,
    MigrateTimelineActivityToMorphRelationsCommand,
  ],
  exports: [
    CleanOrphanedUserWorkspacesCommand,
    CleanOrphanedRoleTargetsCommand,
    MigrateTimelineActivityToMorphRelationsCommand,
  ],
})
export class V1_11_UpgradeVersionCommandModule {}
