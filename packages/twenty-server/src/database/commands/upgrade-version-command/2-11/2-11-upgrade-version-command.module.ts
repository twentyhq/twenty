import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MarkCalendarEventRecordingPreferenceReadOnlyCommand } from 'src/database/commands/upgrade-version-command/2-11/2-11-workspace-command-1799000061000-mark-calendar-event-recording-preference-read-only.command';
import { SyncCallRecordingRequestStatusCommand } from 'src/database/commands/upgrade-version-command/2-11/2-11-workspace-command-1799000060000-sync-call-recording-request-status.command';
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
    MarkCalendarEventRecordingPreferenceReadOnlyCommand,
  ],
})
export class V2_11_UpgradeVersionCommandModule {}
