import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RepairAttachmentTimelineActivityTypesCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787561579075-repair-attachment-timeline-activity-types.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [RepairAttachmentTimelineActivityTypesCommand],
})
export class V2_35_UpgradeVersionCommandModule {}
