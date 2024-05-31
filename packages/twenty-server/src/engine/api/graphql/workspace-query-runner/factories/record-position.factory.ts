import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
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
  ): Promise<number> {
    if (typeof value === 'number') {
      return value;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const query = await this.recordPositionQueryFactory.create(
      RecordPositionQueryType.GET,
      value,
      objectMetadata,
      dataSourceSchema,
    );

    // If the value was 'first', the first record will be the one with the lowest position
    // If the value was 'last', the first record will be the one with the highest position
    const records = await this.workspaceDataSourceService.executeRawQuery(
      query,
      [],
      workspaceId,
      undefined,
    );

    if (
      !isDefined(records) ||
      records.length === 0 ||
      !isDefined(records[0]?.position)
    ) {
      return 1;
    }

    return value === 'first'
      ? records[0].position - 1
      : records[0].position + 1;
  }
}
