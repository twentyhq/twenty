import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InitializePermissionsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-initialize-permissions.command';
import { UpdateViewAggregateOperationsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-update-view-aggregate-operations.command';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, UserWorkspace], 'core'),
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, ObjectMetadataEntity],
      'metadata',
    ),
    WorkspaceDataSourceModule,
    RoleModule,
    UserRoleModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    InitializePermissionsCommand,
    UpdateViewAggregateOperationsCommand,
  ],
  exports: [InitializePermissionsCommand, UpdateViewAggregateOperationsCommand],
})
export class V0_44_UpgradeVersionCommandModule {}
