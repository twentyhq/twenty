import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RenameCallRecordingTabsToTranscriptCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790583246061-rename-call-recording-tabs-to-transcript.command';
import { VerifyCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790590808102-verify-common-record-sharing.command';
import { DeleteFieldLessIndexMetadataCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790595494562-delete-field-less-index-metadata.command';
import { FollowWorkflowVisibilityOnRunsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790595877162-follow-workflow-visibility-on-runs.command';
import { SyncShortLinkObjectCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790615265538-sync-short-link-object.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { LinkChatMessageSendersToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790605326331-link-chat-message-senders-to-workspace-members.command';
import { AddWorkflowRunToChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607161319-add-workflow-run-to-chat-threads.command';
import { SyncDeactivateWorkflowAvailabilityCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607920000-sync-deactivate-workflow-availability.command';
import { RemoveAddNodeWorkflowCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607921000-remove-add-node-workflow-command-menu-item.command';
import { AddInputAskObjectCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790681093095-add-input-ask-object.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    AgentHistoryMigrationModule,
    ApplicationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RenameCallRecordingTabsToTranscriptCommand,
    VerifyCommonRecordSharingCommand,
    DeleteFieldLessIndexMetadataCommand,
    FollowWorkflowVisibilityOnRunsCommand,
    LinkChatMessageSendersToWorkspaceMembersCommand,
    AddWorkflowRunToChatThreadsCommand,
    SyncDeactivateWorkflowAvailabilityCommand,
    RemoveAddNodeWorkflowCommandMenuItemCommand,
    SyncShortLinkObjectCommand,
    AddInputAskObjectCommand,
  ],
})
export class V2_44_UpgradeVersionCommandModule {}
