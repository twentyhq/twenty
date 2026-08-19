import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MarkSearchVectorFieldsSystemCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787079768311-mark-search-vector-fields-system.command';
import { BackfillActivityTargetsJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787123540000-backfill-activity-targets-junction-target.command';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    BackfillActivityTargetsJunctionTargetCommand,
    MarkSearchVectorFieldsSystemCommand,
  ],
})
export class V2_33_UpgradeVersionCommandModule {}
