import { Injectable } from '@nestjs/common';

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

    const records = await this.workspaceDataSourceService.executeRawQuery(
      query,
      [],
      workspaceId,
      undefined,
    );

    return (
      (value === 'first'
        ? records[0]?.position / 2
        : records[0]?.position + 1) || 1
    );
  }
}
