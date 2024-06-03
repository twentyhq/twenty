import { Injectable, Logger } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  RecordPositionQueryFactory,
  RecordPositionQueryType,
} from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { RecordPositionFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/record-position.factory';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

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
        await this.recordPositionQueryFactory.create(
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
          undefined,
        );

      const position = await this.recordPositionFactory.create(
        'last',
        objectMetadata as ObjectMetadataInterface,
        workspaceId,
      );

      for (
        let recordIndex = 0;
        recordIndex < recordsWithoutPosition.length;
        recordIndex++
      ) {
        const recordId = recordsWithoutPosition[recordIndex].id;
        const backfilledPosition = position + recordIndex;

        this.logger.log(
          `Backfilling position ${backfilledPosition} for ${objectMetadata.nameSingular} ${recordId}`,
        );

        if (dryRun) {
          continue;
        }

        const [query, params] = await this.recordPositionQueryFactory.create(
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
          undefined,
        );
      }
    }
  }
}

const hasPositionField = (objectMetadata: ObjectMetadataInterface) =>
  ['company', 'opportunity', 'person'].includes(objectMetadata.nameSingular) ||
  objectMetadata.isCustom;
