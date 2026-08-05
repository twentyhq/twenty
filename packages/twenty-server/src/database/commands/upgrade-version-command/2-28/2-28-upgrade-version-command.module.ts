import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddEmailBlockSettingsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785921674941-add-email-block-settings-command-menu-item.command';
import { RepairOrphanCoreWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785600000000-repair-orphan-core-workflow-versions.command';
import { SyncDiscardDraftWorkflowAvailabilityExpressionCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785858486000-sync-discard-draft-workflow-availability-expression.command';
import { ReownObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786100000000-reown-object-navigation-command-menu-items.command';
import { FlagStandardActionCommandMenuItemsSystemSideEffectCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1786100001000-flag-standard-action-command-menu-items-system-side-effect.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
    TypeOrmModule.forFeature([CommandMenuItemEntity]),
  ],
  providers: [
    AddEmailBlockSettingsCommandMenuItemCommand,
    RepairOrphanCoreWorkflowVersionsCommand,
    SyncDiscardDraftWorkflowAvailabilityExpressionCommand,
    ReownObjectNavigationCommandMenuItemsCommand,
    FlagStandardActionCommandMenuItemsSystemSideEffectCommand,
  ],
})
export class V2_28_UpgradeVersionCommandModule {}
