import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddCalendarEventCallRecordingTabCommand } from 'src/database/commands/upgrade-version-command/2-30/2-30-workspace-command-1786353778242-add-calendar-event-call-recording-tab.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceIteratorModule,
  ],
  providers: [AddCalendarEventCallRecordingTabCommand],
})
export class V2_30_UpgradeVersionCommandModule {}
