import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { StripDerivedRecordFilterPropertiesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792153804491-strip-derived-record-filter-properties.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [StripDerivedRecordFilterPropertiesCommand],
})
export class V2_49_UpgradeVersionCommandModule {}
