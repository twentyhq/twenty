import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncCallRecordingNavigationCommandMenuItemAvailabilityExpressionCommand } from 'src/database/commands/upgrade-version-command/2-17/2-17-workspace-command-1801000000000-sync-call-recording-navigation-command-menu-item-availability-expression.command';
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
    SyncCallRecordingNavigationCommandMenuItemAvailabilityExpressionCommand,
  ],
})
export class V2_17_UpgradeVersionCommandModule {}
