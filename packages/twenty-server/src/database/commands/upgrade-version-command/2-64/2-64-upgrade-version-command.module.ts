import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddFavoritesNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795527933153-add-favorites-navigation-menu-section.command';
import { BackfillUserWorkspaceDefaultAvatarFileIdCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795536145182-backfill-user-workspace-default-avatar-file-id.command';
import { AddStandardInboxViewsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795538284087-add-standard-inbox-views.command';
import { RenameWorkflowsNavigationFolderToAutomationsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795538639852-rename-workflows-navigation-folder-to-automations.command';
import { AddWorkflowsAndAgentsGoToCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795538640852-add-workflows-and-agents-go-to-command-menu-items.command';
import { AddDefaultLayoutNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795595757554-add-default-layout-navigation-menu-items.command';
import { BackfillBillingCustomerStripeCustomerEmailCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795601305717-backfill-billing-customer-stripe-customer-email.command';
import { AddInboxChannelViewsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795619804236-add-inbox-channel-views.command';
import { RevokeRoleWideAccessToChannelObjectsUpgradeCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795648952060-revoke-role-wide-access-to-channel-objects.command';
import { BackfillListViewIsCompactCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795688864238-backfill-list-view-is-compact.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { AgentChatChannelModule } from 'src/engine/metadata-modules/agent-chat-channel/agent-chat-channel.module';
import { ChannelVisibilityModule } from 'src/engine/permissions/channel-visibility/channel-visibility.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    AgentChatChannelModule,
    ApplicationModule,
    ChannelVisibilityModule,
    StripeModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AddFavoritesNavigationMenuSectionCommand,
    BackfillUserWorkspaceDefaultAvatarFileIdCommand,
    AddStandardInboxViewsCommand,
    RenameWorkflowsNavigationFolderToAutomationsCommand,
    AddWorkflowsAndAgentsGoToCommandMenuItemsCommand,
    AddDefaultLayoutNavigationMenuItemsCommand,
    BackfillBillingCustomerStripeCustomerEmailCommand,
    AddInboxChannelViewsCommand,
    RevokeRoleWideAccessToChannelObjectsUpgradeCommand,
    BackfillListViewIsCompactCommand,
  ],
})
export class V2_64_UpgradeVersionCommandModule {}
