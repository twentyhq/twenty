import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinNewAiChatCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791405719721-unpin-new-ai-chat.command';
import { StripDerivedRecordFilterPropertiesCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791717636512-strip-derived-record-filter-properties.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [UnpinNewAiChatCommand, StripDerivedRecordFilterPropertiesCommand],
})
export class V2_47_UpgradeVersionCommandModule {}
