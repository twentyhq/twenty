import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { NormalizeLegacyIndexNamesCommand } from 'src/database/commands/upgrade-version-command/2-17/2-17-workspace-command-1799200000000-normalize-legacy-index-names.command';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [NormalizeLegacyIndexNamesCommand],
})
export class V2_17_UpgradeVersionCommandModule {}
