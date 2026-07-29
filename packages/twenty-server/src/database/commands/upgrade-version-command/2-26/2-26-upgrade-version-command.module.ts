import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RemoveMessageCampaignNavigationMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785324390000-remove-message-campaign-navigation-menu-item.command';
import { AlignMessageCampaignViewFieldPositionsCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785325400000-align-message-campaign-view-field-positions.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    RemoveMessageCampaignNavigationMenuItemCommand,
    AlignMessageCampaignViewFieldPositionsCommand,
  ],
})
export class V2_26_UpgradeVersionCommandModule {}
