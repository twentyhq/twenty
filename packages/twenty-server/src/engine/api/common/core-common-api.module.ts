// tododo
// - try to switch gql find One to common api find One
// - add filter validation in common api
// - add field valdiation in ORM

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonQueryRunners } from 'src/engine/api/common/common-query-runners/common-query-runners';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ProcessNestedRelationsV2Helper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations-v2.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    WorkspaceQueryHookModule,
    WorkspaceQueryRunnerModule,
    PermissionsModule,
    TypeOrmModule.forFeature([RoleTargetsEntity]),
    UserRoleModule,
    ApiKeyModule,
  ],
  providers: [
    ProcessNestedRelationsHelper,
    ProcessNestedRelationsV2Helper,
    ProcessAggregateHelper,
    ...CommonQueryRunners,
  ],
  exports: [...CommonQueryRunners],
})
export class CoreCommonApiModule {}
