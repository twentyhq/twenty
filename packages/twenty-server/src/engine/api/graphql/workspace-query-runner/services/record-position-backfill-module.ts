import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecordPositionBackfillService } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [RecordPositionService, RecordPositionBackfillService],
  exports: [RecordPositionBackfillService],
})
export class RecordPositionBackfillModule {}
