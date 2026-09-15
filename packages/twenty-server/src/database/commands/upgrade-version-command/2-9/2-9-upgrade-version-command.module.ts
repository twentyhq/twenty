import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { BackfillFieldsWidgetNewFieldDefaultVisibilityCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000030000-backfill-fields-widget-new-field-default-visibility.command';
import { AddWorkflowRunStepLogsFieldCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000035000-add-workflow-run-step-logs-field.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValuePairEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    ApplicationModule,
    FieldMetadataModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MigrateAiModelPreferencesCommand,
    AddWorkflowRunStepLogsFieldCommand,
    BackfillFieldsWidgetNewFieldDefaultVisibilityCommand,
  ],
})
export class V2_9_UpgradeVersionCommandModule {}
