import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonArgsHandlers } from 'src/engine/api/common/common-args-handlers/common-query-selected-fields/common-arg-handlers';
import { CommonQueryRunners } from 'src/engine/api/common/common-query-runners/common-query-runners';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ProcessNestedRelationsV2Helper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations-v2.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

@Module({
  imports: [
    WorkspaceQueryHookModule,
    WorkspaceQueryRunnerModule,
    PermissionsModule,
    TypeOrmModule.forFeature([RoleTargetsEntity]),
    UserRoleModule,
    ApiKeyModule,
    WorkspacePermissionsCacheModule,
    FileModule,
    ViewModule,
    ViewFilterModule,
    ViewFilterGroupModule,
  ],
  providers: [
    ProcessNestedRelationsHelper,
    ProcessNestedRelationsV2Helper,
    ...CommonArgsHandlers,
    ProcessAggregateHelper,
    ...CommonQueryRunners,
    CommonResultGettersService,
  ],
  exports: [...CommonQueryRunners],
})
export class CoreCommonApiModule {}
