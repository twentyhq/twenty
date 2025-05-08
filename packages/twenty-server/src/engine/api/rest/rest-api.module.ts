import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RestApiCoreBatchController } from 'src/engine/api/rest/core/controllers/rest-api-core-batch.controller';
import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
import { RestApiCoreServiceV2 } from 'src/engine/api/rest/core/rest-api-core-v2.service';
import { RestApiCoreService } from 'src/engine/api/rest/core/rest-api-core.service';
import { MetadataQueryBuilderModule } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.module';
import { RestApiMetadataController } from 'src/engine/api/rest/metadata/rest-api-metadata.controller';
import { RestApiMetadataService } from 'src/engine/api/rest/metadata/rest-api-metadata.service';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { coreQueryBuilderFactories } from 'src/engine/api/rest/core/query-builder/factories/factories';
import { RestApiDeleteOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-delete-one-resolver.service';
import { CoreQueryBuilderModule } from 'src/engine/api/rest/core/query-builder/core-query-builder.module';
import { RestApiCreateOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-create-one-resolver.service';
import { RestApiUpdateOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-update-one-resolver.service';
import { RestApiGetOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-get-one-resolver.service';
import { RestApiGetManyResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-get-many-resolver.service';

const restApiCoreResolvers = [
  RestApiDeleteOneResolverService,
  RestApiCreateOneResolverService,
  RestApiUpdateOneResolverService,
  RestApiGetOneResolverService,
  RestApiGetManyResolverService,
];

@Module({
  imports: [
    CoreQueryBuilderModule,
    MetadataQueryBuilderModule,
    WorkspaceCacheStorageModule,
    AuthModule,
    HttpModule,
    TwentyORMModule,
    RecordTransformerModule,
    WorkspacePermissionsCacheModule,
  ],
  controllers: [
    RestApiMetadataController,
    RestApiCoreBatchController,
    RestApiCoreController,
  ],
  providers: [
    RestApiMetadataService,
    RestApiCoreService,
    RestApiCoreServiceV2,
    RestApiService,
    ApiEventEmitterService,
    ...coreQueryBuilderFactories,
    ...restApiCoreResolvers,
  ],
  exports: [RestApiMetadataService],
})
export class RestApiModule {}
