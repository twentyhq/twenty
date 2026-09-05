import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ConvertLogicFunctionsToPrebuiltCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788338950836-convert-logic-functions-to-prebuilt.command';
import { BackfillRecordFormCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788524477000-backfill-record-form.command';
import { BackfillMessageListJunctionTargetsCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788616074386-backfill-message-list-junction-targets.command';
import { CreateMessageListMemberViewCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788616075386-create-message-list-member-view.command';
import { MarkPlatformOwnedStandardObjectsSystemCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788616958245-mark-platform-owned-standard-objects-system.command';
import { SyncMessageListRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788639798701-sync-message-list-record-page.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    TypeORMModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    ConvertLogicFunctionsToPrebuiltCommand,
    BackfillRecordFormCommand,
    BackfillMessageListJunctionTargetsCommand,
    CreateMessageListMemberViewCommand,
    MarkPlatformOwnedStandardObjectsSystemCommand,
    SyncMessageListRecordPageCommand,
  ],
})
export class V2_39_UpgradeVersionCommandModule {}
