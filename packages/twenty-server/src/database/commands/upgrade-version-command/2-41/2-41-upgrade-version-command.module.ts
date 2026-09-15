import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CorrectStandardFieldAcronymCasingCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789331219041-correct-standard-field-acronym-casing.command';
import { BackfillWorkspaceWorkflowIdOnWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789350000002-backfill-workspace-workflow-id-on-workflows.command';
import { BackfillCoreVersionPointersCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789370101009-backfill-core-version-pointers.command';
import { MakeStandardChildObjectsInheritedCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789373200001-make-standard-child-objects-inherited.command';
import { BackfillTimelineActivityMessageCampaignIndexesCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789461462000-backfill-timeline-activity-message-campaign-indexes.command';
import { MakeNotesAndTasksInheritTheirTargetsCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789373200002-make-notes-and-tasks-inherit-their-targets.command';
import { MoveMessageCampaignCommandsToCampaignFlagCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789468244000-move-message-campaign-commands-to-campaign-flag.command';
import { RemoveSeeActiveVersionCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789470915878-remove-see-active-version-command-menu-item.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
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
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    CorrectStandardFieldAcronymCasingCommand,
    BackfillWorkspaceWorkflowIdOnWorkflowsCommand,
    BackfillCoreVersionPointersCommand,
    MakeStandardChildObjectsInheritedCommand,
    MakeNotesAndTasksInheritTheirTargetsCommand,
    BackfillTimelineActivityMessageCampaignIndexesCommand,
    MoveMessageCampaignCommandsToCampaignFlagCommand,
    RemoveSeeActiveVersionCommandMenuItemCommand,
  ],
})
export class V2_41_UpgradeVersionCommandModule {}
