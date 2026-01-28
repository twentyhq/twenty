import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonArgsProcessors } from 'src/engine/api/common/common-args-processors/common-args-processors';
import { CommonQueryRunners } from 'src/engine/api/common/common-query-runners/common-query-runners';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { GroupByWithRecordsService } from 'src/engine/api/graphql/graphql-query-runner/group-by/services/group-by-with-records.service';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ProcessNestedRelationsV2Helper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations-v2.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceQueryHookModule,
    WorkspaceQueryRunnerModule,
    PermissionsModule,
    TypeOrmModule.forFeature([RoleTargetEntity]),
    UserRoleModule,
    ApiKeyModule,
    FileModule,
    ViewModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    ThrottlerModule,
    MetricsModule,
    RecordPositionModule,
    RecordTransformerModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
  ],
  providers: [
    ProcessNestedRelationsHelper,
    ProcessNestedRelationsV2Helper,
    ...CommonArgsProcessors,
    ProcessAggregateHelper,
    ...CommonQueryRunners,
    CommonResultGettersService,
    GroupByWithRecordsService,
  ],
  exports: [...CommonQueryRunners],
})
export class CoreCommonApiModule {}
