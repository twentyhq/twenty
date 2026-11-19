import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillLegacyWorkflowVersionLinksCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795015805080-backfill-legacy-workflow-version-links.command';
import { BackfillReadPrivateChannelsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795080173241-backfill-read-private-channels-permission-flag.command';
import { ConvertNotStartedWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795088158840-convert-not-started-workflow-runs.command';
import { AddWorkspaceNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795098842750-add-workspace-navigation-menu-section.command';
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
    BackfillLegacyWorkflowVersionLinksCommand,
    BackfillReadPrivateChannelsPermissionFlagCommand,
    ConvertNotStartedWorkflowRunsCommand,
    AddWorkspaceNavigationMenuSectionCommand,
  ],
})
export class V2_61_UpgradeVersionCommandModule {}
