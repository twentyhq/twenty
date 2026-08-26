import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkflowRunCoreIdFieldsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787748136000-add-workflow-run-core-id-fields.command';
import { BackfillWorkflowRunCoreIdsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787748136001-backfill-workflow-run-core-ids.command';
import { RewriteIsNotNullWorkflowFilterOperandsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787700000000-rewrite-is-not-null-workflow-filter-operands.command';
import { AddCallRecordingSummaryAndTranscriptTabsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787746350922-add-call-recording-summary-and-transcript-tabs.command';
import { SyncMessageCalendarTargetMetadataCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787822578321-sync-message-calendar-target-metadata.command';
import { BackfillMessageCalendarTargetsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787822579321-backfill-message-calendar-targets.command';
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
    RewriteIsNotNullWorkflowFilterOperandsCommand,
    AddCallRecordingSummaryAndTranscriptTabsCommand,
    AddWorkflowRunCoreIdFieldsCommand,
    BackfillWorkflowRunCoreIdsCommand,
    SyncMessageCalendarTargetMetadataCommand,
    BackfillMessageCalendarTargetsCommand,
  ],
})
export class V2_36_UpgradeVersionCommandModule {}
