import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncCallRecordingStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/2-10/2-10-workspace-command-1800000000000-sync-call-recording-standard-objects.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    ApplicationModule,
    WorkspaceMigrationModule,
  ],
  providers: [SyncCallRecordingStandardObjectsCommand],
})
export class V2_10_UpgradeVersionCommandModule {}
