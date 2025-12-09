import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeduplicateUniqueFieldsCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-deduplicate-unique-fields.command';
import { FillNullServerlessFunctionLayerIdCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-fill-null-serverless-function-layer-id.command';
import { MigrateChannelSyncStagesCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-channel-sync-stages.command';
import { MigrateWorkflowStepFilterOperandValueCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-workflow-step-filter-operand-value';
import { RegeneratePersonSearchVectorWithPhonesCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-regenerate-person-search-vector-with-phones.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      FieldMetadataEntity,
      ObjectMetadataEntity,
      IndexMetadataEntity,
      ServerlessFunctionEntity,
      ServerlessFunctionLayerEntity,
    ]),
    DataSourceModule,
    IndexMetadataModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    MigrateWorkflowStepFilterOperandValueCommand,
    MigrateChannelSyncStagesCommand,
    DeduplicateUniqueFieldsCommand,
    FillNullServerlessFunctionLayerIdCommand,
    RegeneratePersonSearchVectorWithPhonesCommand,
  ],
  exports: [
    MigrateChannelSyncStagesCommand,
    MigrateWorkflowStepFilterOperandValueCommand,
    DeduplicateUniqueFieldsCommand,
    FillNullServerlessFunctionLayerIdCommand,
    RegeneratePersonSearchVectorWithPhonesCommand,
  ],
})
export class V1_8_UpgradeVersionCommandModule {}
