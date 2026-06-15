import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncStandardUiCapabilityFlagsCommand } from 'src/database/commands/upgrade-version-command/2-13/2-13-workspace-command-1781277460000-sync-standard-ui-capability-flags.command';
import { SyncCreateRecordCommandAvailabilityExpressionCommand } from 'src/database/commands/upgrade-version-command/2-13/2-13-workspace-command-1781277470000-sync-create-record-command-availability-expression.command';
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
    SyncStandardUiCapabilityFlagsCommand,
    SyncCreateRecordCommandAvailabilityExpressionCommand,
  ],
})
export class V2_13_UpgradeVersionCommandModule {}
