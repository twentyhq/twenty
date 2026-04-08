import { Module } from '@nestjs/common';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceSchemaBuilderModule } from 'src/engine/api/graphql/workspace-schema-builder/workspace-schema-builder.module';
import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    WorkspaceSchemaBuilderModule,
    WorkspaceCacheStorageModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    FeatureFlagModule,
    DataSourceModule,
  ],
  providers: [WorkspaceGraphqlSchemaSDLService, ScalarsExplorerService],
  exports: [WorkspaceGraphqlSchemaSDLService],
})
export class WorkspaceGraphqlSchemaSDLModule {}
