import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  RecordPositionQueryArgs,
  RecordPositionQueryFactory,
  RecordPositionQueryType,
} from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';

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
      const recordWithSamePosition = await this.findRecord(
        {
          recordPositionQueryType: RecordPositionQueryType.FIND_BY_POSITION,
          positionValue: value,
        },
        objectMetadata,
        dataSourceSchema,
        workspaceId,
      );

      if (recordWithSamePosition) {
        throw new Error('Position is not unique');
      }

      return value;
    }

    if (value === 'first') {
      const firstRecord = await this.findRecord(
        {
          recordPositionQueryType: RecordPositionQueryType.FIND_FIRST_RECORD,
        },
        objectMetadata,
        dataSourceSchema,
        workspaceId,
      );

      return isDefined(firstRecord?.position)
        ? firstRecord.position - index - 1
        : 1;
    }

    const lastRecord = await this.findRecord(
      {
        recordPositionQueryType: RecordPositionQueryType.FIND_LAST_RECORD,
      },
      objectMetadata,
      dataSourceSchema,
      workspaceId,
    );

    return isDefined(lastRecord?.position)
      ? lastRecord.position + index + 1
      : 1;
  }

  private async findRecord(
    recordPositionQueryArgs: RecordPositionQueryArgs,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    dataSourceSchema: string,
    workspaceId: string,
  ) {
    const [query, params] = await this.recordPositionQueryFactory.create(
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
