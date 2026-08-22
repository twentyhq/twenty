import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CatchUpTimelineActivityTypeIdsCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787397332209-catch-up-timeline-activity-type-ids.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [CatchUpTimelineActivityTypeIdsCommand],
})
export class V2_34_UpgradeVersionCommandModule {}
