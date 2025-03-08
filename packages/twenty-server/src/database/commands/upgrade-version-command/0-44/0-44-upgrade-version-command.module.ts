import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InitializePermissionsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-initialize-permissions.command';
import { MigrateRelationsToFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-migrate-relations-to-field-metadata.command';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

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
  ],
  providers: [
    InitializePermissionsCommand,
    MigrateRelationsToFieldMetadataCommand,
  ],
  exports: [
    InitializePermissionsCommand,
    MigrateRelationsToFieldMetadataCommand,
  ],
})
export class V0_44_UpgradeVersionCommandModule {}
