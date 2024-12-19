import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhoneCallingCodeCreateColumnCommand } from 'src/database/commands/upgrade-version/0-40/0-40-phone-calling-code-create-column.command';
import { PhoneCallingCodeMigrateDataCommand } from 'src/database/commands/upgrade-version/0-40/0-40-phone-calling-code-migrate-data.command';
import { RecordPositionBackfillCommand } from 'src/database/commands/upgrade-version/0-40/0-40-record-position-backfill.command';
import { UpgradeTo0_40Command } from 'src/database/commands/upgrade-version/0-40/0-40-upgrade-version.command';
import { ViewGroupNoValueBackfillCommand } from 'src/database/commands/upgrade-version/0-40/0-40-view-group-no-value-backfill.command';
import { RecordPositionBackfillModule } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchModule } from 'src/engine/metadata-modules/search/search.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    WorkspaceSyncMetadataCommandsModule,
    SearchModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    RecordPositionBackfillModule,
    FieldMetadataModule,
  ],
  providers: [
    UpgradeTo0_40Command,
    PhoneCallingCodeMigrateDataCommand,
    PhoneCallingCodeCreateColumnCommand,
    WorkspaceMigrationFactory,
    RecordPositionBackfillCommand,
    ViewGroupNoValueBackfillCommand,
  ],
})
export class UpgradeTo0_40CommandModule {}
