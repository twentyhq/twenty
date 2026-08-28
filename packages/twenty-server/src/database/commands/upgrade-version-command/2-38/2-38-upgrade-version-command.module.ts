import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillLinkedTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787899239365-backfill-linked-timeline-activity-happens-at.command';
import { ConfigureTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787908170463-configure-timeline-activity-happens-at.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [ApplicationModule, WorkspaceIteratorModule, WorkspaceCacheModule],
  providers: [
    BackfillLinkedTimelineActivityHappensAtCommand,
    ConfigureTimelineActivityHappensAtCommand,
  ],
})
export class V2_38_UpgradeVersionCommandModule {}
