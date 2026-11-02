import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RenameEmailsTabToMessagesCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793639013340-rename-emails-tab-to-messages.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [RenameEmailsTabToMessagesCommand],
})
export class V2_56_UpgradeVersionCommandModule {}
