import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { DirectExecutionCreateManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-create-many.handler';
import { DirectExecutionCreateOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-create-one.handler';
import { DirectExecutionDeleteManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-delete-many.handler';
import { DirectExecutionDeleteOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-delete-one.handler';
import { DirectExecutionDestroyManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-destroy-many.handler';
import { DirectExecutionDestroyOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-destroy-one.handler';
import { DirectExecutionFindDuplicatesHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-find-duplicates.handler';
import { DirectExecutionFindManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-find-many.handler';
import { DirectExecutionFindOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-find-one.handler';
import { DirectExecutionGroupByHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-group-by.handler';
import { DirectExecutionMergeManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-merge-many.handler';
import { DirectExecutionRestoreManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-restore-many.handler';
import { DirectExecutionRestoreOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-restore-one.handler';
import { DirectExecutionUpdateManyHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-update-many.handler';
import { DirectExecutionUpdateOneHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-update-one.handler';
import { WorkspaceResolverNameMapCacheService } from 'src/engine/api/graphql/direct-execution/services/workspace-resolver-name-map-cache.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CoreCommonApiModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
  ],
  providers: [
    DirectExecutionService,
    WorkspaceResolverNameMapCacheService,
    DirectExecutionFindManyHandler,
    DirectExecutionFindOneHandler,
    DirectExecutionFindDuplicatesHandler,
    DirectExecutionGroupByHandler,
    DirectExecutionCreateOneHandler,
    DirectExecutionCreateManyHandler,
    DirectExecutionUpdateOneHandler,
    DirectExecutionUpdateManyHandler,
    DirectExecutionDeleteOneHandler,
    DirectExecutionDeleteManyHandler,
    DirectExecutionDestroyOneHandler,
    DirectExecutionDestroyManyHandler,
    DirectExecutionRestoreOneHandler,
    DirectExecutionRestoreManyHandler,
    DirectExecutionMergeManyHandler,
  ],
  exports: [DirectExecutionService],
})
export class DirectExecutionModule {}
