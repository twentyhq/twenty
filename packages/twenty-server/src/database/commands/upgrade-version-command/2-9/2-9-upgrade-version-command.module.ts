import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkflowRunStepLogsFieldCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1800000000000-add-workflow-run-step-logs-field.command';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValuePairEntity]),
    WorkspaceIteratorModule,
    ApplicationModule,
    FieldMetadataModule,
    WorkspaceCacheModule,
  ],
  providers: [MigrateAiModelPreferencesCommand, AddWorkflowRunStepLogsFieldCommand],
})
export class V2_9_UpgradeVersionCommandModule {}
