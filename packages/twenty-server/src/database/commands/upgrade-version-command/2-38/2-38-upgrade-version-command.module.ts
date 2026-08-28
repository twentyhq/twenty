import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillLinkedTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787899239365-backfill-linked-timeline-activity-happens-at.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceIteratorModule, WorkspaceCacheModule],
  providers: [BackfillLinkedTimelineActivityHappensAtCommand],
})
export class V2_38_UpgradeVersionCommandModule {}
