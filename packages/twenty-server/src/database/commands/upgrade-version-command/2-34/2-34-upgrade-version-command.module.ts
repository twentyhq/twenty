import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddTimelineActivityTypeSnapshotCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787402000000-add-timeline-activity-type-snapshot.command';
import { ConfigureTimelineActivityRoutingCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787411153000-configure-timeline-activity-routing.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddTimelineActivityTypeSnapshotCommand,
    ConfigureTimelineActivityRoutingCommand,
  ],
})
export class V2_34_UpgradeVersionCommandModule {}
