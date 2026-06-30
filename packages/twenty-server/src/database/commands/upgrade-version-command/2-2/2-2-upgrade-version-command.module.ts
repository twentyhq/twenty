import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SetCalendarEventDescriptionDisplayedMaxRowsCommand } from 'src/database/commands/upgrade-version-command/2-2/2-2-workspace-command-1786000000000-set-calendar-event-description-displayed-max-rows.command';
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
  providers: [SetCalendarEventDescriptionDisplayedMaxRowsCommand],
})
export class V2_2_UpgradeVersionCommandModule {}
