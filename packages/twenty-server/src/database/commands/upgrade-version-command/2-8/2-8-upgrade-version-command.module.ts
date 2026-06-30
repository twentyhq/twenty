import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropChannelStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1798000050000-drop-channel-standard-objects.command';
import { BackfillRelationJoinColumnIndexesCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1798100000000-backfill-relation-join-column-indexes.command';
import { GateDefaultCommandMenuItemsByPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1798100010000-gate-default-command-menu-items-by-permission-flag.command';
import { RestoreChannelAssociationScalarFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1798100020000-restore-channel-association-scalar-field-metadata.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    DropChannelStandardObjectsCommand,
    BackfillRelationJoinColumnIndexesCommand,
    GateDefaultCommandMenuItemsByPermissionFlagCommand,
    RestoreChannelAssociationScalarFieldMetadataCommand,
  ],
})
export class V2_8_UpgradeVersionCommandModule {}
