import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { RestApiCoreController } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
import { RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-many.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { RestApiDeleteManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-many.handler';
import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { RestApiDestroyManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-destroy-many.handler';
import { RestApiDestroyOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-destroy-one.handler';
import { RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-duplicates.handler';
import { RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-many.handler';
import { RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-one.handler';
import { RestApiGroupByHandler } from 'src/engine/api/rest/core/handlers/rest-api-group-by.handler';
import { RestApiMergeManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-merge-many.handler';
import { RestApiRestoreManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-restore-many.handler';
import { RestApiRestoreOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-restore-one.handler';
import { RestApiUpdateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-many.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { restToCommonArgsHandlers } from 'src/engine/api/rest/core/rest-to-common-args-handlers/rest-to-common-args-handlers';
import { RestApiCoreService } from 'src/engine/api/rest/core/services/rest-api-core.service';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

const restApiCoreResolvers = [
  RestApiCreateOneHandler,
  RestApiCreateManyHandler,
  RestApiUpdateOneHandler,
  RestApiUpdateManyHandler,
  RestApiFindOneHandler,
  RestApiFindManyHandler,
  RestApiFindDuplicatesHandler,
  RestApiGroupByHandler,
  RestApiUpdateOneHandler,
  RestApiDestroyOneHandler,
  RestApiDestroyManyHandler,
  RestApiDeleteOneHandler,
  RestApiDeleteManyHandler,
  RestApiRestoreOneHandler,
  RestApiRestoreManyHandler,
  RestApiMergeManyHandler,
];

@Module({
  imports: [
    WorkspaceCacheStorageModule,
    AuthModule,
    ApiKeyModule,
    UserRoleModule,
    HttpModule,
    TwentyORMModule,
    RecordTransformerModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ActorModule,
    FeatureFlagModule,
    CoreCommonApiModule,
    WorkspaceDomainsModule,
    WorkspaceCacheModule,
  ],
  controllers: [RestApiCoreController],
  providers: [
    RestApiService,
    RestApiCoreService,
    ...restApiCoreResolvers,
    ...restToCommonArgsHandlers,
  ],
})
export class RestApiCoreModule {}
