import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { PointAccountsCommandMenuItemsToAppPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-60/2-60-workspace-command-1794826956977-point-accounts-command-menu-items-to-app-preferences.command';
import { DropWorkspaceWorkflowVersionObjectCommand } from 'src/database/commands/upgrade-version-command/2-60/2-60-workspace-command-1794913859925-drop-workspace-workflow-version-object.command';
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
    DropWorkspaceWorkflowVersionObjectCommand,
  ],
})
export class V2_60_UpgradeVersionCommandModule {}
