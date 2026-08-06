import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ReconcileStandardAndCustomRecordPageUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786010741000-reconcile-standard-and-custom-record-page-universal-identifier.command';
import { BackfillRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786010742000-backfill-record-page.command';
import { RepairOrphanCoreWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785600000000-repair-orphan-core-workflow-versions.command';
import { SyncDiscardDraftWorkflowAvailabilityExpressionCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785858486000-sync-discard-draft-workflow-availability-expression.command';
import { AddEmailBlockSettingsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785921674941-add-email-block-settings-command-menu-item.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AddEmailBlockSettingsCommandMenuItemCommand,
    ReconcileStandardAndCustomRecordPageUniversalIdentifierCommand,
    BackfillRecordPageCommand,
    RepairOrphanCoreWorkflowVersionsCommand,
    SyncDiscardDraftWorkflowAvailabilityExpressionCommand,
  ],
})
export class V2_28_UpgradeVersionCommandModule {}
