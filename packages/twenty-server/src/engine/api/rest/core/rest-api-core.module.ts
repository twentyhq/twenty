import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
import { RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-many.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-duplicates.handler';
import { RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-many.handler';
import { RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-one.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { CoreQueryBuilderModule } from 'src/engine/api/rest/core/query-builder/core-query-builder.module';
import { coreQueryBuilderFactories } from 'src/engine/api/rest/core/query-builder/factories/factories';
import { RestApiCoreService } from 'src/engine/api/rest/core/services/rest-api-core.service';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

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
    ApiKeyModule,
    HttpModule,
    TwentyORMModule,
    RecordTransformerModule,
    WorkspacePermissionsCacheModule,
    ActorModule,
    FeatureFlagModule,
  ],
  controllers: [RestApiCoreController],
  providers: [
    RestApiService,
    RestApiCoreService,
    ...coreQueryBuilderFactories,
    ...restApiCoreResolvers,
  ],
})
export class RestApiCoreModule {}
