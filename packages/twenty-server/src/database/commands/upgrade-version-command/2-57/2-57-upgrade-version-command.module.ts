import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillFieldMetadataOptionsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793899027652-backfill-field-metadata-options.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [BackfillFieldMetadataOptionsCommand],
})
export class V2_57_UpgradeVersionCommandModule {}
