import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MarkSearchVectorFieldsSystemCommand } from 'src/database/commands/upgrade-version-command/2-33/2-33-workspace-command-1787079768311-mark-search-vector-fields-system.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [MarkSearchVectorFieldsSystemCommand],
})
export class V2_33_UpgradeVersionCommandModule {}
