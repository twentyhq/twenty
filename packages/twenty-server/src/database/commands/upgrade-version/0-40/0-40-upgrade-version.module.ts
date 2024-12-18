import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecordPositionBackfillCommand } from 'src/database/commands/upgrade-version/0-40/0-40-record-position-backfill.command';
import { UpgradeTo0_40Command } from 'src/database/commands/upgrade-version/0-40/0-40-upgrade-version.command';
import { ViewGroupNoValueBackfillCommand } from 'src/database/commands/upgrade-version/0-40/0-40-view-group-no-value-backfill.command';
import { RecordPositionBackfillModule } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    WorkspaceSyncMetadataCommandsModule,
    RecordPositionBackfillModule,
    FieldMetadataModule,
  ],
  providers: [
    UpgradeTo0_40Command,
    RecordPositionBackfillCommand,
    ViewGroupNoValueBackfillCommand,
  ],
})
export class UpgradeTo0_40CommandModule {}
