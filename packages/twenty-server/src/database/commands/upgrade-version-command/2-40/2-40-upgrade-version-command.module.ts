import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncRecordShareObjectCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788794677636-sync-record-share-object.command';
import { ReactivateSystemSideEffectViewFieldGroupsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788902177727-reactivate-system-side-effect-view-field-groups.command';
import { AddMessageCampaignScheduledAtCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788957151735-add-message-campaign-scheduled-at.command';
import { BackfillCoreWorkflowIdOnWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788960408162-backfill-core-workflow-id-on-workflow-versions.command';
import { ReconcileStandardSkillsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789129759229-reconcile-standard-skills.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFieldGroupEntity, UpgradeMigrationEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    SyncRecordShareObjectCommand,
    ReactivateSystemSideEffectViewFieldGroupsCommand,
    AddMessageCampaignScheduledAtCommand,
    BackfillCoreWorkflowIdOnWorkflowVersionsCommand,
    ReconcileStandardSkillsCommand,
  ],
})
export class V2_40_UpgradeVersionCommandModule {}
