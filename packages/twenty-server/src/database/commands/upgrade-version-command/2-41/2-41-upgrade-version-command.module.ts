import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CorrectStandardFieldAcronymCasingCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789331219041-correct-standard-field-acronym-casing.command';
import { BackfillWorkspaceWorkflowIdOnWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789350000002-backfill-workspace-workflow-id-on-workflows.command';
import { BackfillCoreVersionPointersCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789370101009-backfill-core-version-pointers.command';
import { MakeStandardChildObjectsInheritedCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789373200001-make-standard-child-objects-inherited.command';
import { MakeNotesAndTasksInheritTheirTargetsCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789373200002-make-notes-and-tasks-inherit-their-targets.command';
import { BackfillTimelineActivityMessageCampaignIndexesCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789461462000-backfill-timeline-activity-message-campaign-indexes.command';
import { SeedObjectDefaultViewCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789467778372-seed-object-default-view.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { SeedObjectDefaultViewModule } from 'src/engine/metadata-modules/view/seed-object-default-view.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    ApplicationModule,
    SeedObjectDefaultViewModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    CorrectStandardFieldAcronymCasingCommand,
    BackfillWorkspaceWorkflowIdOnWorkflowsCommand,
    BackfillCoreVersionPointersCommand,
    MakeStandardChildObjectsInheritedCommand,
    MakeNotesAndTasksInheritTheirTargetsCommand,
    BackfillTimelineActivityMessageCampaignIndexesCommand,
    SeedObjectDefaultViewCommand,
  ],
})
export class V2_41_UpgradeVersionCommandModule {}
