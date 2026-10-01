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
import { OpenAgentChatThreadArchivedAtWritabilityCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790672076234-open-agent-chat-thread-archived-at-writability.command';
import { GateConversationsWidgetOnFeatureFlagCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790700866168-gate-conversations-widget-on-feature-flag.command';
import { MoveAgentChatThreadsToRecordModelCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790751626421-move-agent-chat-threads-to-record-model.command';
import { AddChatRecordPageCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790751626422-add-chat-record-page-command-menu-items.command';
import { AddChatRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790756589463-add-chat-record-page.command';
import { RecordPendingFormConversationsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790772993322-record-pending-form-conversations.command';
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
    OpenAgentChatThreadArchivedAtWritabilityCommand,
    GateConversationsWidgetOnFeatureFlagCommand,
    MoveAgentChatThreadsToRecordModelCommand,
    AddChatRecordPageCommandMenuItemsCommand,
    AddChatRecordPageCommand,
    RecordPendingFormConversationsCommand,
  ],
})
export class V2_44_UpgradeVersionCommandModule {}
