import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { AttributeChatMessageSendersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790171503075-attribute-chat-message-senders.command';

@Module({
  imports: [AgentHistoryMigrationModule, AgentHistoryModule, WorkspaceIteratorModule],
  providers: [AttributeChatMessageSendersCommand],
})
export class V2_43_UpgradeVersionCommandModule {}
