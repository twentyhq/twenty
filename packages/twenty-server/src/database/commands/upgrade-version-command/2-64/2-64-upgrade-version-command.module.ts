import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkflowsAndAgentsGoToCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795534631956-add-workflows-and-agents-go-to-command-menu-items.command';
import { RenameWorkflowsNavigationFolderToAutomationsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795534452942-rename-workflows-navigation-folder-to-automations.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { AddFavoritesNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795527933153-add-favorites-navigation-menu-section.command';
import { BackfillUserWorkspaceDefaultAvatarFileIdCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795536145182-backfill-user-workspace-default-avatar-file-id.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RenameWorkflowsNavigationFolderToAutomationsCommand,
    AddWorkflowsAndAgentsGoToCommandMenuItemsCommand,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AddFavoritesNavigationMenuSectionCommand,
    BackfillUserWorkspaceDefaultAvatarFileIdCommand,
  ],
})
export class V2_64_UpgradeVersionCommandModule {}
