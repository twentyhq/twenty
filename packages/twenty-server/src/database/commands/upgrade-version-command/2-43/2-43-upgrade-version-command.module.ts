import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { AttributeChatMessageSendersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790171503075-attribute-chat-message-senders.command';
import { DeleteSystemReadableObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790180964414-delete-system-readable-object-navigation-command-menu-items.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    AgentHistoryMigrationModule,
    AgentHistoryModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AttributeChatMessageSendersCommand,
    DeleteSystemReadableObjectNavigationCommandMenuItemsCommand,
  ],
})
export class V2_43_UpgradeVersionCommandModule {}
