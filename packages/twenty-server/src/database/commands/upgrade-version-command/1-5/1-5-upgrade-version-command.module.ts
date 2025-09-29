import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddPositionsToWorkflowVersionsAndWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/1-5/1-5-add-positions-to-workflow-versions-and-workflow-runs.command';
import { MigrateViewsToCoreCommand } from 'src/database/commands/upgrade-version-command/1-5/1-5-migrate-views-to-core.command';
import { RemoveFavoriteViewRelationCommand } from 'src/database/commands/upgrade-version-command/1-5/1-5-remove-favorite-view-relation.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      FieldMetadataEntity,
      ObjectMetadataEntity,
    ]),
    WorkspaceDataSourceModule,
    WorkspaceSchemaManagerModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    RemoveFavoriteViewRelationCommand,
    AddPositionsToWorkflowVersionsAndWorkflowRunsCommand,
    MigrateViewsToCoreCommand,
  ],
  exports: [
    RemoveFavoriteViewRelationCommand,
    AddPositionsToWorkflowVersionsAndWorkflowRunsCommand,
    MigrateViewsToCoreCommand,
  ],
})
export class V1_5_UpgradeVersionCommandModule {}
