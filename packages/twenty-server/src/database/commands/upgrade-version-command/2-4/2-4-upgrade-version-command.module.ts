import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RebuildUniquePhoneIndexesCommand } from 'src/database/commands/upgrade-version-command/2-4/2-4-workspace-command-1778000000000-rebuild-unique-phone-indexes.command';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [RebuildUniquePhoneIndexesCommand],
})
export class V2_4_UpgradeVersionCommandModule {}
