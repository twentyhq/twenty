import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { GateIndexPageCommandMenuItemsByPageTypeCommand } from 'src/database/commands/upgrade-version-command/2-6/2-6-workspace-command-1798000020000-gate-index-page-command-menu-items-by-page-type.command';
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
  providers: [GateIndexPageCommandMenuItemsByPageTypeCommand],
})
export class V2_6_UpgradeVersionCommandModule {}
