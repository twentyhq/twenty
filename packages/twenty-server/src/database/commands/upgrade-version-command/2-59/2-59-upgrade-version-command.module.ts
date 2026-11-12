import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MarkCustomFieldMetadataOptionsCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794479900000-mark-custom-field-metadata-options.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [ApplicationModule, WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [MarkCustomFieldMetadataOptionsCommand],
})
export class V2_59_UpgradeVersionCommandModule {}
