import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SimplifySearchVectorExpressionCommand } from 'src/database/commands/upgrade-version/0-31/0-32/0-32-simplify-search-vector-expression';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { SearchModule } from 'src/engine/metadata-modules/search/search.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    WorkspaceSyncMetadataCommandsModule,
    SearchModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [SimplifySearchVectorExpressionCommand],
})
export class SimplifySearchVectorExpressionCommandModule {}
