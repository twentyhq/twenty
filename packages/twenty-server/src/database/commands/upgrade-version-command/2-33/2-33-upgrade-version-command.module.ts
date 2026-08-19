import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActivityTargetsJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787123540000-backfill-activity-targets-junction-target.command';
import { AddTimelineActivityStructuredColumnsCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787123550000-add-timeline-activity-structured-columns.command';
import { SeedStandardTimelineActivityRulesCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787125100000-seed-standard-timeline-activity-rules.command';
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
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    BackfillActivityTargetsJunctionTargetCommand,
    AddTimelineActivityStructuredColumnsCommand,
    SeedStandardTimelineActivityRulesCommand,
  ],
})
export class V2_33_UpgradeVersionCommandModule {}
