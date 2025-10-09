import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateChannelSyncStagesCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-channel-sync-stages.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      FieldMetadataEntity,
      ObjectMetadataEntity,
    ]),
    WorkspaceDataSourceModule,
  ],
  providers: [MigrateChannelSyncStagesCommand],
  exports: [MigrateChannelSyncStagesCommand],
})
export class V1_10_UpgradeVersionCommandModule {}
