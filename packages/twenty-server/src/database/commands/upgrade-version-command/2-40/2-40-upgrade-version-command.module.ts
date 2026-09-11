import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncRecordShareObjectCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788794677636-sync-record-share-object.command';
import { AddMessageCampaignScheduledAtCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788957151735-add-message-campaign-scheduled-at.command';
import { BackfillCoreWorkflowIdOnWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788960408162-backfill-core-workflow-id-on-workflow-versions.command';
import { MakeCallRecordingPrivateCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100000000-make-call-recording-private.command';
import { BackfillCallRecordingSharesCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100000001-backfill-call-recording-shares.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    ApplicationModule,
    RecordShareModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    SyncRecordShareObjectCommand,
    AddMessageCampaignScheduledAtCommand,
    BackfillCoreWorkflowIdOnWorkflowVersionsCommand,
    MakeCallRecordingPrivateCommand,
    BackfillCallRecordingSharesCommand,
  ],
})
export class V2_40_UpgradeVersionCommandModule {}
