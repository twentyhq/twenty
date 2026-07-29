import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddNotRecordedCallRecordingStatusCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785239640000-add-not-recorded-call-recording-status.command';
import { ReconcileIndexViewUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785255689000-reconcile-index-view-universal-identifier.command';
import { DemoteAndBackfillApplicationIndexViewCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785255690000-demote-and-backfill-application-index-view.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity, ViewEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    AddNotRecordedCallRecordingStatusCommand,
    ReconcileIndexViewUniversalIdentifierCommand,
    DemoteAndBackfillApplicationIndexViewCommand,
  ],
})
export class V2_26_UpgradeVersionCommandModule {}
