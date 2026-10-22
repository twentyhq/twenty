import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { EnableGlobalChatCommandsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792657124414-enable-global-chat-commands.command';
import { FileSettledAgentChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792612809770-file-settled-agent-chat-threads.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    FileSettledAgentChatThreadsCommand,
    EnableGlobalChatCommandsCommand,
  ],
})
export class V2_51_UpgradeVersionCommandModule {}
