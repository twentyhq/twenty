import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActivityTargetsJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787123540000-backfill-activity-targets-junction-target.command';
import { MigrateCommandMenuItemLabelsToPlaceholdersCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787127900000-migrate-command-menu-item-labels-to-placeholders.command';
import { ReplaceTimelineActivityNameWithTypeCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787400001000-replace-timeline-activity-name-with-type.command';
import { MarkSearchVectorFieldsSystemCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787138325228-mark-search-vector-fields-system.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    BackfillActivityTargetsJunctionTargetCommand,
    MarkSearchVectorFieldsSystemCommand,
    MigrateCommandMenuItemLabelsToPlaceholdersCommand,
    ReplaceTimelineActivityNameWithTypeCommand,
  ],
})
export class V2_33_UpgradeVersionCommandModule {}
