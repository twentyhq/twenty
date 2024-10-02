import { Module } from '@nestjs/common';

import { GraphqlQueryResolverFactory } from 'src/engine/api/graphql/graphql-query-runner/factories/graphql-query-resolver.factory';
import { GraphqlQueryRunnerService } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.service';
import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';
import { GraphqlQueryFindDuplicatesResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-duplicates-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { GraphqlQueryUpdateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-many-resolver.service';
import { GraphqlQueryUpdateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-one-resolver.service';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';

const graphqlQueryResolvers = [
  GraphqlQueryFindOneResolverService,
  GraphqlQueryFindManyResolverService,
  GraphqlQueryFindDuplicatesResolverService,
  GraphqlQueryCreateManyResolverService,
  GraphqlQueryDestroyOneResolverService,
  GraphqlQueryUpdateOneResolverService,
  GraphqlQueryUpdateManyResolverService,
];

@Module({
  imports: [WorkspaceQueryHookModule, WorkspaceQueryRunnerModule],
  providers: [
    GraphqlQueryRunnerService,
    GraphqlQueryResolverFactory,
    ...graphqlQueryResolvers,
  ],
  exports: [GraphqlQueryRunnerService],
})
export class GraphqlQueryRunnerModule {}
