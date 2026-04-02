import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { WorkspaceResolverNameMapCacheService } from 'src/engine/api/graphql/direct-execution/services/workspace-resolver-name-map-cache.service';
import { WorkspaceResolverBuilderModule } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.module';
import { WorkspaceGraphqlSchemaSDLModule } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CoreCommonApiModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
    WorkspaceResolverBuilderModule,
    WorkspaceGraphqlSchemaSDLModule,
    MetricsModule,
  ],
  providers: [DirectExecutionService, WorkspaceResolverNameMapCacheService],
  exports: [DirectExecutionService],
})
export class DirectExecutionModule {}
