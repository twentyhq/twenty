import { Injectable } from '@nestjs/common';

export enum RecordPositionQueryType {
  FIND_FIRST_RECORD = 'FIND_FIRST_RECORD',
  FIND_LAST_RECORD = 'FIND_LAST_RECORD',
  FIND_BY_POSITION = 'FIND_BY_POSITION',
  UPDATE_POSITION = 'UPDATE_POSITION',
}

type FindByPositionQueryArgs = {
  positionValue: number;
  recordPositionQueryType: RecordPositionQueryType.FIND_BY_POSITION;
};

type FindFirstRecordQueryArgs = {
  recordPositionQueryType: RecordPositionQueryType.FIND_FIRST_RECORD;
};

type FindLastRecordQueryArgs = {
  recordPositionQueryType: RecordPositionQueryType.FIND_LAST_RECORD;
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
  | FindFirstRecordQueryArgs
  | FindLastRecordQueryArgs
  | UpdatePositionQueryArgs;

@Injectable()
export class RecordPositionQueryFactory {
  create(
    recordPositionQueryArgs: RecordPositionQueryArgs,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    const name =
      (objectMetadata.isCustom ? '_' : '') + objectMetadata.nameSingular;

    switch (recordPositionQueryArgs.recordPositionQueryType) {
      case RecordPositionQueryType.FIND_BY_POSITION:
        return this.buildFindByPositionQuery(
          recordPositionQueryArgs as FindByPositionQueryArgs,
          name,
          dataSourceSchema,
        );
      case RecordPositionQueryType.FIND_FIRST_RECORD:
        return this.buildFindFirstRecordQuery(name, dataSourceSchema);
      case RecordPositionQueryType.FIND_LAST_RECORD:
        return this.buildFindLastRecordQuery(name, dataSourceSchema);
      case RecordPositionQueryType.UPDATE_POSITION:
        return this.buildUpdatePositionQuery(
          recordPositionQueryArgs as UpdatePositionQueryArgs,
          name,
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
    return [
      `SELECT * FROM ${dataSourceSchema}."${name}"
            WHERE "position" = $1`,
      [positionValue],
    ];
  }

  private buildFindFirstRecordQuery(
    name: string,
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    return this.buildFindRecordQuery(name, dataSourceSchema, 'ASC');
  }

  private buildFindLastRecordQuery(
    name: string,
    dataSourceSchema: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    return this.buildFindRecordQuery(name, dataSourceSchema, 'DESC');
  }

  private buildFindRecordQuery(
    name: string,
    dataSourceSchema: string,
    orderBy: string,
  ): [RecordPositionQuery, RecordPositionQueryParams] {
    return [
      `SELECT * FROM ${dataSourceSchema}."${name}"
            ORDER BY "position" ${orderBy}
            LIMIT 1`,
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
