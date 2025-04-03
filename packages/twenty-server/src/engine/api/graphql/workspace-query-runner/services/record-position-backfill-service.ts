import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordPositionQueryType } from 'src/engine/core-modules/record-position/types/record-position-query.type';
import { buildRecordPositionQuery } from 'src/engine/core-modules/record-position/utils/build-record-position-query.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class RecordPositionBackfillService {
  private readonly logger = new Logger(RecordPositionBackfillService.name);
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async backfill(workspaceId: string, dryRun: boolean) {
    this.logger.log(
      `Starting backfilling record positions for workspace ${workspaceId}`,
    );

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const objectMetadataCollection = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        fields: {
          name: 'position',
          type: FieldMetadataType.POSITION,
        },
      },
      relations: {
        fields: true,
      },
    });

    for (const objectMetadata of objectMetadataCollection) {
      const [recordsWithoutPositionQuery, recordsWithoutPositionQueryParams] =
        buildRecordPositionQuery(
          {
            recordPositionQueryType: RecordPositionQueryType.FIND_BY_POSITION,
            positionValue: null,
          },
          objectMetadata,
          dataSourceSchema,
        );

      const recordsWithoutPosition =
        await this.workspaceDataSourceService.executeRawQuery(
          recordsWithoutPositionQuery,
          recordsWithoutPositionQueryParams,
          workspaceId,
        );

      if (
        !isDefined(recordsWithoutPosition) ||
        recordsWithoutPosition?.length === 0
      ) {
        this.logger.log(
          `No records without position for ${objectMetadata.nameSingular}`,
        );
        continue;
      }

      const position = await this.recordPositionService.buildRecordPosition({
        objectMetadata: {
          isCustom: objectMetadata.isCustom,
          nameSingular: objectMetadata.nameSingular,
        },
        value: 'last',
        workspaceId,
      });

      for (
        let recordIndex = 0;
        recordIndex < recordsWithoutPosition.length;
        recordIndex++
      ) {
        const recordId = recordsWithoutPosition[recordIndex].id;

        if (!recordId) {
          this.logger.log(
            `Fetched record without id for ${objectMetadata.nameSingular}`,
          );
          continue;
        }

        const backfilledPosition = position + recordIndex;

        this.logger.log(
          `Backfilling position ${backfilledPosition} for ${objectMetadata.nameSingular} ${recordId}`,
        );

        if (dryRun) {
          continue;
        }

        const [query, params] = buildRecordPositionQuery(
          {
            recordPositionQueryType: RecordPositionQueryType.UPDATE_POSITION,
            recordId: recordsWithoutPosition[recordIndex].id,
            positionValue: position + recordIndex,
          },
          objectMetadata,
          dataSourceSchema,
        );

        await this.workspaceDataSourceService.executeRawQuery(
          query,
          params,
          workspaceId,
        );
      }
    }
  }
}
