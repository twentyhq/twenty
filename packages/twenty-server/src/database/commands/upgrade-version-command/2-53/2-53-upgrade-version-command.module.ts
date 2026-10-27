import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { GateMergeCommandOnRecordPermissionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793121423580-gate-merge-command-on-record-permissions.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [GateMergeCommandOnRecordPermissionsCommand],
})
export class V2_53_UpgradeVersionCommandModule {}
