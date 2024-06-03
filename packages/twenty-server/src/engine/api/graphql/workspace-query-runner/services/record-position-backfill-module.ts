import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { RecordPositionQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { RecordPositionFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/record-position.factory';
import { RecordPositionBackfillService } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-service';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

@Module({
  imports: [WorkspaceDataSourceModule, ObjectMetadataModule],
  providers: [
    RecordPositionFactory,
    RecordPositionQueryFactory,
    RecordPositionBackfillService,
  ],
  exports: [RecordPositionBackfillService],
})
export class RecordPositionBackfillModule {}
