import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMessageStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/2-13/2-13-workspace-command-1799000031000-backfill-message-standard-objects.command';
import { AddComposeCampaignCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-13/2-13-workspace-command-1799000040000-add-compose-campaign-command-menu-item.command';
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
    BackfillMessageStandardObjectsCommand,
    AddComposeCampaignCommandMenuItemCommand,
    SyncStandardUiCapabilityFlagsCommand,
    SyncCreateRecordCommandAvailabilityExpressionCommand,
  ],
})
export class V2_13_UpgradeVersionCommandModule {}
