import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';

import {
  RecordPositionQueryArgs,
  RecordPositionQueryFactory,
  RecordPositionQueryType,
} from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class RecordPositionFactory {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly recordPositionQueryFactory: RecordPositionQueryFactory,
  ) {}

  async create(
    value: number | 'first' | 'last',
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
    index = 0,
  ): Promise<number> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    if (typeof value === 'number') {
      return value;
    }

    if (value === 'first') {
      const recordWithMinPosition = await this.findRecordPosition(
        {
          recordPositionQueryType: RecordPositionQueryType.FIND_MIN_POSITION,
        },
        objectMetadata,
        dataSourceSchema,
        workspaceId,
      );

      return isDefined(recordWithMinPosition?.position)
        ? recordWithMinPosition.position - index - 1
        : 1;
    }

    const recordWithMaxPosition = await this.findRecordPosition(
      {
        recordPositionQueryType: RecordPositionQueryType.FIND_MAX_POSITION,
      },
      objectMetadata,
      dataSourceSchema,
      workspaceId,
    );

    return isDefined(recordWithMaxPosition?.position)
      ? recordWithMaxPosition.position + index + 1
      : 1;
  }

  private async findRecordPosition(
    recordPositionQueryArgs: RecordPositionQueryArgs,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    dataSourceSchema: string,
    workspaceId: string,
  ) {
    const [query, params] = this.recordPositionQueryFactory.create(
      recordPositionQueryArgs,
      objectMetadata,
      dataSourceSchema,
    );

    const records = await this.workspaceDataSourceService.executeRawQuery(
      query,
      params,
      workspaceId,
    );

    return records?.[0];
  }
}
