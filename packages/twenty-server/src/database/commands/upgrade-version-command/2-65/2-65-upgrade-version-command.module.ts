import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { LockSyncedStandardFieldsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795711734552-lock-synced-standard-fields.command';
import { ProvisionRichTextFilesColumnsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [ProvisionRichTextFilesColumnsCommand, LockSyncedStandardFieldsCommand],
})
export class V2_65_UpgradeVersionCommandModule {}
