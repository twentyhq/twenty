import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinNewAiChatCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791405719721-unpin-new-ai-chat.command';
import { UnfollowChatsMembersOnlyReadCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791728623417-unfollow-chats-members-only-read.command';
import { AddAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791731133972-add-agent-chat-channels.command';
import { SeedDefaultAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791732187511-seed-default-agent-chat-channels.command';
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
    UnpinNewAiChatCommand,
    UnfollowChatsMembersOnlyReadCommand,
    AddAgentChatChannelsCommand,
    SeedDefaultAgentChatChannelsCommand,
  ],
})
export class V2_47_UpgradeVersionCommandModule {}
