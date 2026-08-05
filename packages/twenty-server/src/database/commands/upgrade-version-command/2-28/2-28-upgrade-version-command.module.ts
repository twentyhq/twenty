import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddEmailBlockSettingsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785921674941-add-email-block-settings-command-menu-item.command';
import { RepairOrphanCoreWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785600000000-repair-orphan-core-workflow-versions.command';
import { AddApplicationUniversalIdentifierToActorCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785943810000-add-application-universal-identifier-to-actor.command';
import { SyncDiscardDraftWorkflowAvailabilityExpressionCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785858486000-sync-discard-draft-workflow-availability-expression.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
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
  ],
  providers: [
    AddEmailBlockSettingsCommandMenuItemCommand,
    RepairOrphanCoreWorkflowVersionsCommand,
    AddApplicationUniversalIdentifierToActorCommand,
    SyncDiscardDraftWorkflowAvailabilityExpressionCommand,
  ],
})
export class V2_28_UpgradeVersionCommandModule {}
