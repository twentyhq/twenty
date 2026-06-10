import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncCallRecordingRequestStatusCommand } from 'src/database/commands/upgrade-version-command/2-12/2-12-workspace-command-1799000060000-sync-call-recording-request-status.command';
import { DropCalendarEventRecordingPreferenceCommand } from 'src/database/commands/upgrade-version-command/2-12/2-12-workspace-command-1799000061000-drop-calendar-event-recording-preference.command';
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
    SyncCallRecordingRequestStatusCommand,
    DropCalendarEventRecordingPreferenceCommand,
  ],
})
export class V2_12_UpgradeVersionCommandModule {}
