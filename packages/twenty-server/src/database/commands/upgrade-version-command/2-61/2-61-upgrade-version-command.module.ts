import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillLegacyWorkflowVersionLinksCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795015805080-backfill-legacy-workflow-version-links.command';
import { BackfillReadPrivateChannelsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795080173241-backfill-read-private-channels-permission-flag.command';
import { ConvertNotStartedWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795088158840-convert-not-started-workflow-runs.command';
import { DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795095338141-drop-not-started-workflow-run-status.command';
import { RepairSkippedStandardCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795103130063-repair-skipped-standard-command-menu-items.command';
import { AddWorkspaceNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795106019718-add-workspace-navigation-menu-section.command';
import { ReownApplicationViewFieldsOnForeignViewsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795121785907-reown-application-view-fields-on-foreign-views.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([CommandMenuItemEntity, ViewFieldEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    BackfillLegacyWorkflowVersionLinksCommand,
    BackfillReadPrivateChannelsPermissionFlagCommand,
    ConvertNotStartedWorkflowRunsCommand,
    DropNotStartedWorkflowRunStatusCommand,
    RepairSkippedStandardCommandMenuItemsCommand,
    AddWorkspaceNavigationMenuSectionCommand,
    ReownApplicationViewFieldsOnForeignViewsCommand,
  ],
})
export class V2_61_UpgradeVersionCommandModule {}
