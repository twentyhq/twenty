import { Injectable } from '@nestjs/common';

import { computeTableName } from 'src/engine/utils/compute-table-name.util';

export enum RecordPositionQueryType {
  FIND_MIN_POSITION = 'FIND_MIN_POSITION',
  FIND_MAX_POSITION = 'FIND_MAX_POSITION',
  FIND_BY_POSITION = 'FIND_BY_POSITION',
  UPDATE_POSITION = 'UPDATE_POSITION',
}

type FindByPositionQueryArgs = {
  positionValue: number | null;
  recordPositionQueryType: RecordPositionQueryType.FIND_BY_POSITION;
};

type FindMinPositionQueryArgs = {
  recordPositionQueryType: RecordPositionQueryType.FIND_MIN_POSITION;
};

type FindMaxPositionQueryArgs = {
  recordPositionQueryType: RecordPositionQueryType.FIND_MAX_POSITION;
};

type UpdatePositionQueryArgs = {
  recordId: string;
  positionValue: number;
  recordPositionQueryType: RecordPositionQueryType.UPDATE_POSITION;
};

type RecordPositionQuery = string;

type RecordPositionQueryParams = any[];

export type RecordPositionQueryArgs =
  | FindByPositionQueryArgs
  | FindMinPositionQueryArgs
  | FindMaxPositionQueryArgs
  | UpdatePositionQueryArgs;

@Injectable()
export class RecordPositionQueryFactory {
  create(
    recordPositionQueryArgs: RecordPositionQueryArgs,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    const tableName = computeTableName(
      objectMetadata.nameSingular,
      objectMetadata.isCustom,
    );

    switch (recordPositionQueryArgs.recordPositionQueryType) {
      case RecordPositionQueryType.FIND_BY_POSITION:
        return this.buildFindByPositionQuery(
          recordPositionQueryArgs satisfies FindByPositionQueryArgs,
          tableName,
          dataSourceSchema,
        );
      case RecordPositionQueryType.FIND_MIN_POSITION:
        return this.buildFindMinPositionQuery(tableName, dataSourceSchema);
      case RecordPositionQueryType.FIND_MAX_POSITION:
        return this.buildFindMaxPositionQuery(tableName, dataSourceSchema);
      case RecordPositionQueryType.UPDATE_POSITION:
        return this.buildUpdatePositionQuery(
          recordPositionQueryArgs satisfies UpdatePositionQueryArgs,
          tableName,
          dataSourceSchema,
        );
      default:
        throw new Error('Invalid RecordPositionQueryType');
    }
  }

  private buildFindByPositionQuery(
    { positionValue }: FindByPositionQueryArgs,
    name: string,
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    const positionStringParam = positionValue ? '= $1' : 'IS NULL';

    return [
      `SELECT id, position FROM ${dataSourceSchema}."${name}"
            WHERE "position" ${positionStringParam}`,
      positionValue ? [positionValue] : [],
    ];
  }

  private buildFindMaxPositionQuery(
    name: string,
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    return [
      `SELECT MAX(position) as position FROM ${dataSourceSchema}."${name}"`,
      [],
    ];
  }

  private buildFindMinPositionQuery(
    name: string,
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    return [
      `SELECT MIN(position) as position FROM ${dataSourceSchema}."${name}"`,
      [],
    ];
  }

  private buildUpdatePositionQuery(
    { recordId, positionValue }: UpdatePositionQueryArgs,
    name: string,
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    return [
      `UPDATE ${dataSourceSchema}."${name}"
            SET "position" = $1
            WHERE "id" = $2`,
      [positionValue, recordId],
    ];
  }
}
