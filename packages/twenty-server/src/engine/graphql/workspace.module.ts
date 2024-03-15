import { Module } from '@nestjs/common';

import { MetadataModule } from 'src/engine-metadata/metadata.module';
import { DataSourceModule } from 'src/engine-metadata/data-source/data-source.module';
import { WorkspaceSchemaStorageModule } from 'src/engine/graphql/workspace-schema-storage/workspace-schema-storage.module';
import { ObjectMetadataModule } from 'src/engine-metadata/object-metadata/object-metadata.module';
import { ScalarsExplorerService } from 'src/engine-workspace/services/scalars-explorer.service';
import { WorkspaceSchemaBuilderModule } from 'src/engine/graphql/workspace-schema-builder/workspace-schema-builder.module';
import { WorkspaceResolverBuilderModule } from 'src/engine/graphql/workspace-resolver-builder/workspace-resolver-builder.module';

import { WorkspaceFactory } from './workspace.factory';

@Module({
  imports: [
    MetadataModule,
    DataSourceModule,
    ObjectMetadataModule,
    WorkspaceSchemaBuilderModule,
    WorkspaceResolverBuilderModule,
    WorkspaceSchemaStorageModule,
  ],
  providers: [WorkspaceFactory, ScalarsExplorerService],
  exports: [WorkspaceFactory],
})
export class WorkspaceModule {}
