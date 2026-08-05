import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AdoptAndBackfillApplicationObjectNavigationMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786200001000-adopt-and-backfill-application-object-navigation-menu-item.command';
import { ReconcileObjectNavigationMenuItemUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786200000000-reconcile-object-navigation-menu-item-universal-identifier.command';
import { RepairOrphanCoreWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785600000000-repair-orphan-core-workflow-versions.command';
import { SyncDiscardDraftWorkflowAvailabilityExpressionCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786000000000-sync-discard-draft-workflow-availability-expression.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NavigationMenuItemEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    RepairOrphanCoreWorkflowVersionsCommand,
    SyncDiscardDraftWorkflowAvailabilityExpressionCommand,
    ReconcileObjectNavigationMenuItemUniversalIdentifierCommand,
    AdoptAndBackfillApplicationObjectNavigationMenuItemCommand,
  ],
})
export class V2_28_UpgradeVersionCommandModule {}
