import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncRecordShareObjectCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788794677636-sync-record-share-object.command';
import { AddMessageCampaignScheduledAtCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788957151735-add-message-campaign-scheduled-at.command';
import { BackfillCoreWorkflowIdOnWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788960408162-backfill-core-workflow-id-on-workflow-versions.command';
import { ReconcileStandardSkillsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789129759229-reconcile-standard-skills.command';
import { MakeStandardUniqueIndexesPartialCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1810000006000-make-standard-unique-indexes-partial.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([IndexMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    SyncRecordShareObjectCommand,
    AddMessageCampaignScheduledAtCommand,
    BackfillCoreWorkflowIdOnWorkflowVersionsCommand,
    ReconcileStandardSkillsCommand,
    MakeStandardUniqueIndexesPartialCommand,
  ],
})
export class V2_40_UpgradeVersionCommandModule {}
