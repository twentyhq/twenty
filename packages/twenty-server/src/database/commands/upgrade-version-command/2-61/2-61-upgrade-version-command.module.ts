import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillLegacyWorkflowVersionLinksCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795015805080-backfill-legacy-workflow-version-links.command';
import { BackfillReadPrivateChannelsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795080173241-backfill-read-private-channels-permission-flag.command';
import { ConvertNotStartedWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795088158840-convert-not-started-workflow-runs.command';
import { RepairSkippedStandardCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795103130063-repair-skipped-standard-command-menu-items.command';
import { AddWorkspaceNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795106019718-add-workspace-navigation-menu-section.command';
import { ConvertPermissionStorageObjectsToTablesCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795258335000-convert-permission-storage-objects-to-tables.command';
import { DeleteStandardHelperAgentCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795261783307-delete-standard-helper-agent.command';
import { RestoreNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795287331295-restore-not-started-workflow-run-status.command';
import { TypeAccessGroupsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795264768000-type-access-groups.command';
import { AccessGroupComputationModule } from 'src/engine/permissions/internal/access-group/access-group-computation.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    AccessGroupComputationModule,
    ApplicationModule,
    TypeOrmModule.forFeature([CommandMenuItemEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    BackfillLegacyWorkflowVersionLinksCommand,
    BackfillReadPrivateChannelsPermissionFlagCommand,
    ConvertNotStartedWorkflowRunsCommand,
    RepairSkippedStandardCommandMenuItemsCommand,
    AddWorkspaceNavigationMenuSectionCommand,
    ConvertPermissionStorageObjectsToTablesCommand,
    DeleteStandardHelperAgentCommand,
    TypeAccessGroupsCommand,
    RestoreNotStartedWorkflowRunStatusCommand,
  ],
})
export class V2_61_UpgradeVersionCommandModule {}
