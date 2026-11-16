import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MakeChatsSearchableByTitleCommand } from 'src/database/commands/upgrade-version-command/2-60/2-60-workspace-command-1794838104396-make-chats-searchable-by-title.command';
import { RelabelChatTargetsCommand } from 'src/database/commands/upgrade-version-command/2-60/2-60-workspace-command-1794838140456-relabel-chat-targets.command';
import { PointAccountsCommandMenuItemsToAppPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-60/2-60-workspace-command-1794826956977-point-accounts-command-menu-items-to-app-preferences.command';
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
  providers: [
    PointAccountsCommandMenuItemsToAppPreferencesCommand,
    MakeChatsSearchableByTitleCommand,
    RelabelChatTargetsCommand,
  ],
})
export class V2_60_UpgradeVersionCommandModule {}
