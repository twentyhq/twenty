import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ConvertLogicFunctionsToPrebuiltCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788338950836-convert-logic-functions-to-prebuilt.command';
import { BackfillRecordFormCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788524477000-backfill-record-form.command';
import { SyncRecordShareObjectCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788553681056-sync-record-share-object.command';
import { MakeCallRecordingPrivateCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788555747635-make-call-recording-private.command';
import { BackfillCallRecordingSharesCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788555749940-backfill-call-recording-shares.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    RecordShareModule,
    TypeORMModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    ConvertLogicFunctionsToPrebuiltCommand,
    BackfillRecordFormCommand,
    SyncRecordShareObjectCommand,
    MakeCallRecordingPrivateCommand,
    BackfillCallRecordingSharesCommand,
  ],
})
export class V2_39_UpgradeVersionCommandModule {}
