import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RelabelAppPermissionFlagsCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792420196290-relabel-app-permission-flags.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule, WorkspaceMigrationModule],
  providers: [RelabelAppPermissionFlagsCommand],
})
export class V2_50_UpgradeVersionCommandModule {}
