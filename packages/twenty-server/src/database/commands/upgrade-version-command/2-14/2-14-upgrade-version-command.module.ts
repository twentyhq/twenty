import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncCallRecordingRequestStatusCommand } from 'src/database/commands/upgrade-version-command/2-14/2-14-workspace-command-1799000065000-sync-call-recording-request-status.command';
import { DropCalendarEventRecordingPreferenceCommand } from 'src/database/commands/upgrade-version-command/2-14/2-14-workspace-command-1799000066000-drop-calendar-event-recording-preference.command';
import { FixStandardRelationFieldLabelsIconsCommand } from 'src/database/commands/upgrade-version-command/2-14/2-14-workspace-command-1799000040000-fix-standard-relation-field-labels-icons.command';
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
    FixStandardRelationFieldLabelsIconsCommand,
    SyncCallRecordingRequestStatusCommand,
    DropCalendarEventRecordingPreferenceCommand,
  ],
})
export class V2_14_UpgradeVersionCommandModule {}
