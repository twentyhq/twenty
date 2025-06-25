import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FixSchemaArrayTypeCommand } from 'src/database/commands/upgrade-version-command/1-1/1-1-fix-schema-array-type.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FieldMetadataEntity], 'core'),
    WorkspaceDataSourceModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceHealthModule,
    WorkspaceDataSourceModule,
    TypeORMModule,
  ],
  providers: [FixSchemaArrayTypeCommand],
  exports: [FixSchemaArrayTypeCommand],
})
export class V1_1_UpgradeVersionCommandModule {}
