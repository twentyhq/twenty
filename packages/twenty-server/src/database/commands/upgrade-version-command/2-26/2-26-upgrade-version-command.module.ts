import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkspaceMemberOpenRecordInCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785250300000-add-workspace-member-open-record-in.command';
import { SyncObjectDefaultOpenRecordInCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785258000000-sync-object-default-open-record-in.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    AddWorkspaceMemberOpenRecordInCommand,
    SyncObjectDefaultOpenRecordInCommand,
  ],
})
export class V2_26_UpgradeVersionCommandModule {}
