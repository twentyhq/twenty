import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';

import {
  RecordPositionQueryArgs,
  RecordPositionQueryType,
} from 'src/engine/core-modules/record-position/types/record-position-query.type';
import { buildRecordPositionQuery } from 'src/engine/core-modules/record-position/utils/build-record-position-query.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

export type RecordPositionServiceCreateArgs = {
  value: number | 'first' | 'last';
  objectMetadata: { isCustom: boolean; nameSingular: string };
  workspaceId: string;
  index?: number;
};

@Injectable()
export class RecordPositionService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async buildRecordPosition({
    objectMetadata,
    value,
    workspaceId,
    index = 0,
  }: RecordPositionServiceCreateArgs): Promise<number> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    if (typeof value === 'number') {
      return value;
    }

    if (value === 'first') {
      const recordWithMinPosition =
        await this.createAndExecuteRecordPositionQuery(
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

    const recordWithMaxPosition =
      await this.createAndExecuteRecordPositionQuery(
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

  private async createAndExecuteRecordPositionQuery(
    recordPositionQueryArgs: RecordPositionQueryArgs,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    dataSourceSchema: string,
    workspaceId: string,
  ) {
    const [query, params] = buildRecordPositionQuery(
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
