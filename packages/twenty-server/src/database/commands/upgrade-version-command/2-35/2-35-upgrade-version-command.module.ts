import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddSystemWorkflowsNavigationMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787664272000-add-system-workflows-navigation-menu-item.command';
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
  providers: [AddSystemWorkflowsNavigationMenuItemCommand],
})
export class V2_35_UpgradeVersionCommandModule {}
