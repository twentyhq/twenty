import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddRecordShareNoneAccessLevelCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876639146-add-record-share-none-access-level.command';
import { RestrictExportRecordsToIndexPageCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790837443029-restrict-export-records-to-index-page.command';
import { GateWorkflowCommandsOnRecordUpdatePermissionCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790853316722-gate-workflow-commands-on-record-update-permission.command';
import { RemoveSeeVersionWorkflowRunCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790860694324-remove-see-version-workflow-run-command-menu-item.command';
import { AddAgentChatThreadParticipantObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790884925593-add-agent-chat-thread-participant-object.command';
import { BackfillAgentChatThreadInboxStateCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790884925594-backfill-agent-chat-thread-inbox-state.command';
import { AddAiChatInboxCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790884925595-add-ai-chat-inbox-command-menu-items.command';
import { UnpinNewAiChatCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790884925596-unpin-new-ai-chat-command-menu-item.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    AgentHistoryMigrationModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RestrictExportRecordsToIndexPageCommand,
    AddRecordShareNoneAccessLevelCommand,
    GateWorkflowCommandsOnRecordUpdatePermissionCommand,
    RemoveSeeVersionWorkflowRunCommandMenuItemCommand,
    AddAgentChatThreadParticipantObjectCommand,
    BackfillAgentChatThreadInboxStateCommand,
    AddAiChatInboxCommandMenuItemsCommand,
    UnpinNewAiChatCommandMenuItemCommand,
  ],
})
export class V2_45_UpgradeVersionCommandModule {}
