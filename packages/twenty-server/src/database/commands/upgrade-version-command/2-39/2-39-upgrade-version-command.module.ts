import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ClearUnrestrictableFieldPermissionsCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788531440100-clear-unrestrictable-field-permissions.command';
import { ConvertLogicFunctionsToPrebuiltCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788338950836-convert-logic-functions-to-prebuilt.command';
import { BackfillRecordFormCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788524477000-backfill-record-form.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    TypeORMModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    BackfillRecordFormCommand,
    ClearUnrestrictableFieldPermissionsCommand,
    ConvertLogicFunctionsToPrebuiltCommand,
  ],
})
export class V2_39_UpgradeVersionCommandModule {}
