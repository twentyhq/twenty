import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillStandardPermissionFlagsCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-workspace-command-1799000001000-backfill-standard-permission-flags.command';
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
  providers: [BackfillStandardPermissionFlagsCommand],
})
export class V2_5_UpgradeVersionCommandModule {}
