import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { AnalyticsQueryResolver } from 'src/engine/core-modules/analytics-query/analytics-query.resolver';
import { AnalyticsQueryService } from 'src/engine/core-modules/analytics-query/analytics-query.service';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    WorkspaceQueryRunnerModule,
    ObjectMetadataModule,
    TwentyORMModule,
  ],
  exports: [],
  providers: [AnalyticsQueryResolver, AnalyticsQueryService],
})
export class AnalyticsQueryModule {}
