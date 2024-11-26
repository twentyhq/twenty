import { Module } from '@nestjs/common';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryCreateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-one-resolver.service';
import { GraphqlQueryDeleteManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-delete-many-resolver.service';
import { GraphqlQueryDeleteOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-delete-one-resolver.service';
import { GraphqlQueryDestroyManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-many-resolver.service';
import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';
import { GraphqlQueryFindDuplicatesResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-duplicates-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { GraphqlQueryRestoreManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-restore-many-resolver.service';
import { GraphqlQueryRestoreOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-restore-one-resolver.service';
import { GraphqlQuerySearchResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-search-resolver.service';
import { GraphqlQueryUpdateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-many-resolver.service';
import { GraphqlQueryUpdateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-one-resolver.service';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

const graphqlQueryResolvers = [
  GraphqlQueryCreateManyResolverService,
  GraphqlQueryCreateOneResolverService,
  GraphqlQueryDeleteManyResolverService,
  GraphqlQueryDeleteOneResolverService,
  GraphqlQueryDestroyManyResolverService,
  GraphqlQueryDestroyOneResolverService,
  GraphqlQueryFindDuplicatesResolverService,
  GraphqlQueryFindManyResolverService,
  GraphqlQueryFindOneResolverService,
  GraphqlQueryRestoreManyResolverService,
  GraphqlQueryRestoreOneResolverService,
  GraphqlQuerySearchResolverService,
  GraphqlQueryUpdateManyResolverService,
  GraphqlQueryUpdateOneResolverService,
];

@Module({
  imports: [
    WorkspaceQueryHookModule,
    WorkspaceQueryRunnerModule,
    FeatureFlagModule,
  ],
  providers: [ApiEventEmitterService, ...graphqlQueryResolvers],
  exports: [...graphqlQueryResolvers],
})
export class GraphqlQueryRunnerModule {}
