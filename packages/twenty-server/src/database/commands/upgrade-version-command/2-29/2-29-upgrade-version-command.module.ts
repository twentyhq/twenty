import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddCalendarEventTranscriptTabCommand } from 'src/database/commands/upgrade-version-command/2-29/2-29-workspace-command-1786098569000-add-calendar-event-transcript-tab.command';
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
  providers: [AddCalendarEventTranscriptTabCommand],
})
export class V2_29_UpgradeVersionCommandModule {}
