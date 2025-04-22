import {
  FindByPositionQueryArgs,
  RecordPositionQueryArgs,
  RecordPositionQueryType,
  UpdatePositionQueryArgs,
} from 'src/engine/core-modules/record-position/types/record-position-query.type';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

type RecordPositionQuery = string;

type RecordPositionQueryParams = any[];

export const buildRecordPositionQuery = (
  recordPositionQueryArgs: RecordPositionQueryArgs,
  objectMetadata: { isCustom: boolean; nameSingular: string },
  dataSourceSchema: string,
): [RecordPositionQuery, RecordPositionQueryParams] => {
  const tableName = computeTableName(
    objectMetadata.nameSingular,
    objectMetadata.isCustom,
  );

  switch (recordPositionQueryArgs.recordPositionQueryType) {
    case RecordPositionQueryType.FIND_BY_POSITION:
      return buildFindByPositionQuery(
        recordPositionQueryArgs satisfies FindByPositionQueryArgs,
        tableName,
        dataSourceSchema,
      );
    case RecordPositionQueryType.FIND_MIN_POSITION:
      return buildFindMinPositionQuery(tableName, dataSourceSchema);
    case RecordPositionQueryType.FIND_MAX_POSITION:
      return buildFindMaxPositionQuery(tableName, dataSourceSchema);
    case RecordPositionQueryType.UPDATE_POSITION:
      return buildUpdatePositionQuery(
        recordPositionQueryArgs satisfies UpdatePositionQueryArgs,
        tableName,
        dataSourceSchema,
      );
    default:
      throw new Error('Invalid RecordPositionQueryType');
  }
};

const buildFindByPositionQuery = (
  { positionValue }: FindByPositionQueryArgs,
  name: string,
  dataSourceSchema: string,
): [RecordPositionQuery, RecordPositionQueryParams] => {
  const positionStringParam = positionValue ? '= $1' : 'IS NULL';

  return [
    `SELECT id, position FROM ${dataSourceSchema}."${name}"
            WHERE "position" ${positionStringParam}`,
    positionValue ? [positionValue] : [],
  ];
};

const buildFindMaxPositionQuery = (
  name: string,
  dataSourceSchema: string,
): [RecordPositionQuery, RecordPositionQueryParams] => {
  return [
    `SELECT MAX(position) as position FROM ${dataSourceSchema}."${name}"`,
    [],
  ];
};

const buildFindMinPositionQuery = (
  name: string,
  dataSourceSchema: string,
): [RecordPositionQuery, RecordPositionQueryParams] => {
  return [
    `SELECT MIN(position) as position FROM ${dataSourceSchema}."${name}"`,
    [],
  ];
};

const buildUpdatePositionQuery = (
  { recordId, positionValue }: UpdatePositionQueryArgs,
  name: string,
  dataSourceSchema: string,
): [RecordPositionQuery, RecordPositionQueryParams] => {
  return [
    `UPDATE ${dataSourceSchema}."${name}"
            SET "position" = $1
            WHERE "id" = $2`,
    [positionValue, recordId],
  ];
};
