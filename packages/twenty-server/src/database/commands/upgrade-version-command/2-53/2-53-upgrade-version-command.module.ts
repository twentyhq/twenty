import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChatAssistantParticipationCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793111719062-add-chat-assistant-participation.command';
import { AddInboxAndChatsNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793174702016-add-inbox-and-chats-navigation-menu-items.command';
import { AddWorkspaceNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793174702017-add-workspace-navigation-menu-section.command';
import { AddPinnedNavigationMenuCommandsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793174702020-add-pinned-navigation-menu-commands.command';
import { AddFavoritesNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793174702022-add-favorites-navigation-menu-section.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddChatAssistantParticipationCommand,
    AddInboxAndChatsNavigationMenuItemsCommand,
    AddWorkspaceNavigationMenuSectionCommand,
    AddPinnedNavigationMenuCommandsCommand,
    AddFavoritesNavigationMenuSectionCommand,
  ],
})
export class V2_53_UpgradeVersionCommandModule {}
