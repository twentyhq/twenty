import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillStandardPermissionFlagDefinitionsCommand } from 'src/database/commands/upgrade-version-command/2-4/2-4-workspace-command-1799000001000-backfill-standard-permission-flag-definitions.command';
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
  providers: [BackfillStandardPermissionFlagDefinitionsCommand],
})
export class V2_4_UpgradeVersionCommandModule {}
