import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ProcessNestedRelationsV2Helper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations-v2.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { GraphqlQueryCreateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-one-resolver.service';
import { GraphqlQueryDeleteManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-delete-many-resolver.service';
import { GraphqlQueryDeleteOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-delete-one-resolver.service';
import { GraphqlQueryDestroyManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-many-resolver.service';
import { GraphqlQueryDestroyOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-destroy-one-resolver.service';
import { GraphqlQueryFindDuplicatesResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-duplicates-resolver.service';
import { GraphqlQueryFindManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-many-resolver.service';
import { GraphqlQueryFindOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-one-resolver.service';
import { GraphqlQueryGroupByResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-group-by-resolver.service';
import { GraphqlQueryMergeManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-merge-many-resolver.service';
import { GraphqlQueryRestoreManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-restore-many-resolver.service';
import { GraphqlQueryRestoreOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-restore-one-resolver.service';
import { GraphqlQueryUpdateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-many-resolver.service';
import { GraphqlQueryUpdateOneResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-update-one-resolver.service';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { CoreViewModule } from 'src/engine/core-modules/view/view.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

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
  GraphqlQueryGroupByResolverService,
  GraphqlQueryMergeManyResolverService,
  GraphqlQueryRestoreManyResolverService,
  GraphqlQueryRestoreOneResolverService,
  GraphqlQueryUpdateManyResolverService,
  GraphqlQueryUpdateOneResolverService,
];

@Module({
  imports: [
    WorkspaceQueryHookModule,
    WorkspaceQueryRunnerModule,
    PermissionsModule,
    TypeOrmModule.forFeature([RoleTargetsEntity]),
    UserRoleModule,
    ApiKeyModule,
    CoreViewModule,
  ],
  providers: [
    ProcessNestedRelationsHelper,
    ProcessNestedRelationsV2Helper,
    ProcessAggregateHelper,
    ...graphqlQueryResolvers,
  ],
  exports: [...graphqlQueryResolvers],
})
export class GraphqlQueryRunnerModule {}
