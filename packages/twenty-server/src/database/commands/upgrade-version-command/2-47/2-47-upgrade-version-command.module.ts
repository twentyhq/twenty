import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinNewAiChatCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791405719721-unpin-new-ai-chat.command';
import { AddAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791725203167-add-agent-chat-channels.command';
import { SeedDefaultAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791729923276-seed-default-agent-chat-channels.command';
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
    AddAgentChatChannelsCommand,
    SeedDefaultAgentChatChannelsCommand,
  ],
})
export class V2_47_UpgradeVersionCommandModule {}
