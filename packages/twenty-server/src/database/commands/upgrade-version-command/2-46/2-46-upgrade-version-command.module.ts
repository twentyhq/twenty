import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddAgentChatThreadParticipantObjectCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019631-add-agent-chat-thread-participant-object.command';
import { BackfillAgentChatThreadInboxStateCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019632-backfill-agent-chat-thread-inbox-state.command';
import { AddAiChatInboxCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019633-add-ai-chat-inbox-command-menu-items.command';
import { AllowAiChatInboxCommandsOnSeveralChatsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791009973891-allow-ai-chat-inbox-commands-on-several-chats.command';
import { MakeAgentChatThreadParticipantsPrivateCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791056679663-make-agent-chat-thread-participants-private.command';
import { ScheduleAgentChatThreadSnoozeEndsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791093059050-schedule-agent-chat-thread-snooze-ends.command';
import { UnpinNewAiChatCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790942019634-unpin-new-ai-chat-command-menu-item.command';
import { ShareEmailAndCalendarThroughRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791034548868-share-email-and-calendar-through-record-shares.command';
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
    UnpinNewAiChatCommandMenuItemCommand,
    AllowAiChatInboxCommandsOnSeveralChatsCommand,
    MakeAgentChatThreadParticipantsPrivateCommand,
    ScheduleAgentChatThreadSnoozeEndsCommand,
    ShareEmailAndCalendarThroughRecordSharesCommand,
  ],
})
export class V2_46_UpgradeVersionCommandModule {}
