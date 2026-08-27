import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RepairAttachmentTimelineActivityTypesCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787561579075-repair-attachment-timeline-activity-types.command';
import { BackfillCommandMenuItemTargetObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787572700000-backfill-command-menu-item-target-object-metadata.command';
import { RestoreStandardDefaultRelationFieldsCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787582101000-restore-standard-default-relation-fields.command';
import { RepairTimelineActivityTargetFieldNamesCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787641226000-repair-timeline-activity-target-field-names.command';
import { ContractTimelineActivityCompatibilityCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787648000000-contract-timeline-activity-compatibility.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RepairAttachmentTimelineActivityTypesCommand,
    BackfillCommandMenuItemTargetObjectMetadataCommand,
    RestoreStandardDefaultRelationFieldsCommand,
    RepairTimelineActivityTargetFieldNamesCommand,
    ContractTimelineActivityCompatibilityCommand,
  ],
})
export class V2_35_UpgradeVersionCommandModule {}
