import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddAgentChatThreadParticipantObjectCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019631-add-agent-chat-thread-participant-object.command';
import { BackfillAgentChatThreadInboxStateCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019632-backfill-agent-chat-thread-inbox-state.command';
import { AddAiChatInboxCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019633-add-ai-chat-inbox-command-menu-items.command';
import { DropWorkflowRunFromChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791208395308-drop-workflow-run-from-chat-threads.command';
import { DropAgentTurnEvaluationObjectCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791216273979-drop-agent-turn-evaluation-object.command';
import { BackfillAgentAndWorkflowIsSystemCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791130332894-backfill-agent-and-workflow-is-system.command';
import { TurnHiddenAgentMessagesIntoSystemMessagesCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791204952095-turn-hidden-agent-messages-into-system-messages.command';
import { AddAgentTurnRunFieldsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791227584393-add-agent-turn-run-fields.command';
import { BackfillFailedAgentTurnsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791227584394-backfill-failed-agent-turns.command';
import { SuspendPausedAgentStepsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791306663446-suspend-paused-agent-steps.command';
import { AddAgentChatThreadSubscriptionsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791322315043-add-agent-chat-thread-subscriptions.command';
import { DeleteOrphanedWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791369613345-delete-orphaned-workflow-runs.command';
import { LimitWorkflowCommandsToSingleSelectionCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791391050203-limit-workflow-commands-to-single-selection.command';
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
    AddAgentChatThreadParticipantObjectCommand,
    BackfillAgentChatThreadInboxStateCommand,
    AddAiChatInboxCommandMenuItemsCommand,
    BackfillAgentAndWorkflowIsSystemCommand,
    TurnHiddenAgentMessagesIntoSystemMessagesCommand,
    DropWorkflowRunFromChatThreadsCommand,
    DropAgentTurnEvaluationObjectCommand,
    AddAgentTurnRunFieldsCommand,
    BackfillFailedAgentTurnsCommand,
    SuspendPausedAgentStepsCommand,
    AddAgentChatThreadSubscriptionsCommand,
    DeleteOrphanedWorkflowRunsCommand,
    LimitWorkflowCommandsToSingleSelectionCommand,
  ],
})
export class V2_46_UpgradeVersionCommandModule {}
