import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillLegacyWorkflowVersionLinksCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795015805080-backfill-legacy-workflow-version-links.command';
import { BackfillReadPrivateChannelsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795080173241-backfill-read-private-channels-permission-flag.command';
import { DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795082316248-drop-not-started-workflow-run-status.command';
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
    DropNotStartedWorkflowRunStatusCommand,
  ],
})
export class V2_61_UpgradeVersionCommandModule {}
