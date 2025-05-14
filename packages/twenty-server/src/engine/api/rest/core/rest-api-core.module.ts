import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-one.handler';
import { RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-many.handler';
import { CoreQueryBuilderModule } from 'src/engine/api/rest/core/query-builder/core-query-builder.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
import { coreQueryBuilderFactories } from 'src/engine/api/rest/core/query-builder/factories/factories';
import { RestApiCoreService } from 'src/engine/api/rest/core/services/rest-api-core.service';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-many.handler';
import { RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-duplicates.handler';

const restApiCoreResolvers = [
  RestApiDeleteOneHandler,
  RestApiCreateOneHandler,
  RestApiCreateManyHandler,
  RestApiUpdateOneHandler,
  RestApiFindOneHandler,
  RestApiFindManyHandler,
  RestApiFindDuplicatesHandler,
];

@Module({
  imports: [
    CoreQueryBuilderModule,
    WorkspaceCacheStorageModule,
    AuthModule,
    HttpModule,
    TwentyORMModule,
    RecordTransformerModule,
    WorkspacePermissionsCacheModule,
  ],
  controllers: [RestApiCoreController],
  providers: [
    RestApiService,
    RestApiCoreService,
    ApiEventEmitterService,
    ...coreQueryBuilderFactories,
    ...restApiCoreResolvers,
  ],
})
export class RestApiCoreModule {}
