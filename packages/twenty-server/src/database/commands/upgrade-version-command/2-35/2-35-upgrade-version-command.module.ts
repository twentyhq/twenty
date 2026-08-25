import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RepairAttachmentTimelineActivityTypesCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787561579075-repair-attachment-timeline-activity-types.command';
import { BackfillCommandMenuItemTargetObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787572700000-backfill-command-menu-item-target-object-metadata.command';
import { RewriteObjectNavigationCommandMenuItemPayloadCommand } from 'src/database/commands/upgrade-version-command/2-35/2-35-workspace-command-1787647818016-rewrite-object-navigation-command-menu-item-payload.command';
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
    RepairAttachmentTimelineActivityTypesCommand,
    BackfillCommandMenuItemTargetObjectMetadataCommand,
    RewriteObjectNavigationCommandMenuItemPayloadCommand,
  ],
})
export class V2_35_UpgradeVersionCommandModule {}
