import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { EnableGlobalChatCommandsCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792736549015-enable-global-chat-commands.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [EnableGlobalChatCommandsCommand],
})
export class V2_52_UpgradeVersionCommandModule {}
