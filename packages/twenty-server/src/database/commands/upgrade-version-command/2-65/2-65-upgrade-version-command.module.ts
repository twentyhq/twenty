import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ProvisionRichTextFilesColumnsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command';
import { LockSyncedCalendarEventFieldsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795709867411-lock-synced-calendar-event-fields.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    ProvisionRichTextFilesColumnsCommand,
    LockSyncedCalendarEventFieldsCommand,
  ],
})
export class V2_65_UpgradeVersionCommandModule {}
