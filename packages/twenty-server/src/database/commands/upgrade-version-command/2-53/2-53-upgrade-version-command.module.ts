import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddPageCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793132225758-add-page-command-menu-items.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [AddPageCommandMenuItemsCommand],
})
export class V2_53_UpgradeVersionCommandModule {}
