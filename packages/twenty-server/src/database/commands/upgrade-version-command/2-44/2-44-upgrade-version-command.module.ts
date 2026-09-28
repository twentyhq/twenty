import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RenameCallRecordingTabsToTranscriptCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790583246061-rename-call-recording-tabs-to-transcript.command';
import { VerifyCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790590808102-verify-common-record-sharing.command';
import { DeleteFieldLessIndexMetadataCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790595494562-delete-field-less-index-metadata.command';
import { FollowWorkflowVisibilityOnRunsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790595877162-follow-workflow-visibility-on-runs.command';
import { SyncDeactivateWorkflowAvailabilityCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790599725000-sync-deactivate-workflow-availability.command';
import { RemoveAddNodeWorkflowCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790601763000-remove-add-node-workflow-command-menu-item.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RenameCallRecordingTabsToTranscriptCommand,
    VerifyCommonRecordSharingCommand,
    DeleteFieldLessIndexMetadataCommand,
    FollowWorkflowVisibilityOnRunsCommand,
    SyncDeactivateWorkflowAvailabilityCommand,
    RemoveAddNodeWorkflowCommandMenuItemCommand,
  ],
})
export class V2_44_UpgradeVersionCommandModule {}
