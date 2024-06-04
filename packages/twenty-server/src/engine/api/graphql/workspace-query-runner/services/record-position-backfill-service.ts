import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  RecordPositionQueryFactory,
  RecordPositionQueryType,
} from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { RecordPositionFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/record-position.factory';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { hasPositionField } from 'src/engine/metadata-modules/object-metadata/utils/has-position-field.util';

@Injectable()
export class RecordPositionBackfillService {
  private readonly logger = new Logger(RecordPositionBackfillService.name);
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly recordPositionFactory: RecordPositionFactory,
    private readonly recordPositionQueryFactory: RecordPositionQueryFactory,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async backfill(workspaceId: string, dryRun: boolean) {
    this.logger.log(
      `Starting backfilling record positions for workspace ${workspaceId}`,
    );

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const objectMetadataEntities =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId, {
        where: { isSystem: false },
      });

    const objectMetadataWithPosition =
      objectMetadataEntities.filter(hasPositionField);

    for (const objectMetadata of objectMetadataWithPosition) {
      const [recordsWithoutPositionQuery, recordsWithoutPositionQueryParams] =
        this.recordPositionQueryFactory.create(
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

      const position = await this.recordPositionFactory.create(
        'last',
        {
          isCustom: objectMetadata.isCustom,
          nameSingular: objectMetadata.nameSingular,
        },
        workspaceId,
      );

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

        const [query, params] = this.recordPositionQueryFactory.create(
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
