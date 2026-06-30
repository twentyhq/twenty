import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateManualTriggerVariablesToPayloadCommand } from 'src/database/commands/upgrade-version-command/2-15/2-15-workspace-command-1800000001000-migrate-manual-trigger-variables-to-payload.command';
import { SyncCalendarEventRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-15/2-15-workspace-command-1800000002000-sync-calendar-event-record-page.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MigrateManualTriggerVariablesToPayloadCommand,
    SyncCalendarEventRecordPageCommand,
  ],
})
export class V2_15_UpgradeVersionCommandModule {}
