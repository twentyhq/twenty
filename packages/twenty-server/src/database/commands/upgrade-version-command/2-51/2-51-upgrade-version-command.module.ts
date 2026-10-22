import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FileSettledAgentChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792612809770-file-settled-agent-chat-threads.command';
import { MigrateRichTextToTiptapCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792668505000-migrate-rich-text-to-tiptap.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [FileSettledAgentChatThreadsCommand, MigrateRichTextToTiptapCommand],
})
export class V2_51_UpgradeVersionCommandModule {}
