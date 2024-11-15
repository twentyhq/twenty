import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UpdateRichTextSearchVectorCommand } from 'src/database/commands/upgrade-version/0-32/0-33/0-33-update-rich-text-search-vector-expression';
import { UpgradeTo0_33Command } from 'src/database/commands/upgrade-version/0-32/0-33/0-33-upgrade-version.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchModule } from 'src/engine/metadata-modules/search/search.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    WorkspaceSyncMetadataCommandsModule,
    SearchModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [UpgradeTo0_33Command, UpdateRichTextSearchVectorCommand],
})
export class UpgradeTo0_33CommandModule {}
