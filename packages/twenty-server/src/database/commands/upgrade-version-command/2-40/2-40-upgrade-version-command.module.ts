import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncRecordShareObjectCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788794677636-sync-record-share-object.command';
import { MakeCallRecordingPrivateCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788894100000-make-call-recording-private.command';
import { BackfillCallRecordingSharesCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788894100001-backfill-call-recording-shares.command';
import { MakeStandardChildObjectsInheritedCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788894200001-make-standard-child-objects-inherited.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    ApplicationModule,
    RecordShareModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    SyncRecordShareObjectCommand,
    MakeCallRecordingPrivateCommand,
    BackfillCallRecordingSharesCommand,
    MakeStandardChildObjectsInheritedCommand,
  ],
})
export class V2_40_UpgradeVersionCommandModule {}
