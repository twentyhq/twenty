import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { EnableEditLayoutAcrossAppCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787906715270-enable-edit-layout-across-app.command';
import { BackfillLinkedTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787914663665-backfill-linked-timeline-activity-happens-at.command';
import { ConfigureTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787918663365-configure-timeline-activity-happens-at.command';
import { SurfaceTargetRelationsOnRecordPagesCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787926797984-surface-target-relations-on-record-pages.command';
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
  providers: [
    EnableEditLayoutAcrossAppCommand,
    BackfillLinkedTimelineActivityHappensAtCommand,
    ConfigureTimelineActivityHappensAtCommand,
    SurfaceTargetRelationsOnRecordPagesCommand,
  ],
})
export class V2_38_UpgradeVersionCommandModule {}
