import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CleanupCalendarEventRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1800000003000-cleanup-calendar-event-record-page.command';
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
  providers: [CleanupCalendarEventRecordPageCommand],
})
export class V2_16_UpgradeVersionCommandModule {}
