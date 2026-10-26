import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FileSettledAgentChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792612809770-file-settled-agent-chat-threads.command';
import { DeleteConnectedAccountsOutsideProviderScopeCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792675225627-delete-connected-accounts-outside-provider-scope.command';
import { AddInboxNavigationMenuTabCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792737550430-add-inbox-navigation-menu-tab.command';
import { AddWorkspaceNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792743446000-add-workspace-navigation-menu-section.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    ConnectedAccountMetadataModule,
  ],
  providers: [
    FileSettledAgentChatThreadsCommand,
    DeleteConnectedAccountsOutsideProviderScopeCommand,
    AddInboxNavigationMenuTabCommand,
    AddWorkspaceNavigationMenuSectionCommand,
  ],
})
export class V2_51_UpgradeVersionCommandModule {}
