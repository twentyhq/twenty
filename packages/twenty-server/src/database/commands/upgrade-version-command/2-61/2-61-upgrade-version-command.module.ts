import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillLegacyWorkflowVersionLinksCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795015805080-backfill-legacy-workflow-version-links.command';
import { BackfillReadPrivateChannelsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795080173241-backfill-read-private-channels-permission-flag.command';
import { ConvertNotStartedWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795088158840-convert-not-started-workflow-runs.command';
import { DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795095338141-drop-not-started-workflow-run-status.command';
import { ReownApplicationViewFieldsOnForeignViewsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795103218645-reown-application-view-fields-on-foreign-views.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFieldEntity]),
    ApplicationModule,
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
    ReownApplicationViewFieldsOnForeignViewsCommand,
  ],
})
export class V2_61_UpgradeVersionCommandModule {}
