import { Module } from '@nestjs/common';

import { RecordPositionBackfillJob } from 'src/engine/api/graphql/workspace-query-runner/jobs/record-position-backfill.job';
import { RecordPositionBackfillModule } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    DataSourceModule,
    RecordPositionBackfillModule,
  ],
  providers: [RecordPositionBackfillJob],
})
export class WorkspaceQueryRunnerJobModule {}
