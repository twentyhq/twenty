import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillApplicationInitialViewFieldsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1794998487418-backfill-application-initial-view-fields.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [BackfillApplicationInitialViewFieldsCommand],
})
export class V2_61_UpgradeVersionCommandModule {}
