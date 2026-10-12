import { Module } from '@nestjs/common';

import { CommonArgsProcessors } from 'src/engine/api/common/common-args-processors/common-args-processors';
import { GroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/group-by-arg-processor.service';
import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonQueryRunners } from 'src/engine/api/common/common-query-runners/common-query-runners';
import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { GroupByWithRecordsService } from 'src/engine/api/graphql/graphql-query-runner/group-by/services/group-by-with-records.service';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { ViewFilterGroupModule } from 'src/engine/metadata-modules/view-filter-group/view-filter-group.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceQueryHookModule,
    FileModule,
    ViewModule,
    ViewFilterModule,
    ViewFilterGroupModule,
    UsageLimitModule,
    UsageModule,
    MetricsModule,
    RecordPositionModule,
    RecordShareModule,
    RecordTransformerModule,
    WorkspaceCacheModule,
  ],
  providers: [
    ProcessNestedRelationsHelper,
    ...CommonArgsProcessors,
    ...CommonQueryRunners,
    CommonResultGettersService,
    GroupByWithRecordsService,
  ],
  exports: [...CommonQueryRunners, GroupByArgProcessorService],
})
export class CoreCommonApiModule {}
