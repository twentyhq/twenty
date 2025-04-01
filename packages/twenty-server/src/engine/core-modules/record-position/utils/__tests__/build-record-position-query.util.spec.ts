import { RecordPositionQueryType } from 'src/engine/core-modules/record-position/types/record-position-query.type';
import { buildRecordPositionQuery } from 'src/engine/core-modules/record-position/utils/build-record-position-query.util';

describe('buildRecordPositionQuery', () => {
  const objectMetadataItem = {
    isCustom: false,
    nameSingular: 'company',
  };
  const dataSourceSchema = 'workspace_test';

  it('should return query and params for FIND_BY_POSITION', async () => {
    const positionValue = 1;
    const queryType = RecordPositionQueryType.FIND_BY_POSITION;
    const [query, params] = buildRecordPositionQuery(
      { positionValue, recordPositionQueryType: queryType },
      objectMetadataItem,
      dataSourceSchema,
    );

    expect(query).toEqual(
      `SELECT id, position FROM ${dataSourceSchema}."${objectMetadataItem.nameSingular}"
            WHERE "position" = $1`,
    );
    expect(params).toEqual([positionValue]);
  });

  it('should return query and params for FIND_MIN_POSITION', async () => {
    const queryType = RecordPositionQueryType.FIND_MIN_POSITION;
    const [query, params] = buildRecordPositionQuery(
      { recordPositionQueryType: queryType },
      objectMetadataItem,
      dataSourceSchema,
    );

    expect(query).toEqual(
      `SELECT MIN(position) as position FROM ${dataSourceSchema}."${objectMetadataItem.nameSingular}"`,
    );
    expect(params).toEqual([]);
  });

  it('should return query and params for FIND_MAX_POSITION', async () => {
    const queryType = RecordPositionQueryType.FIND_MAX_POSITION;
    const [query, params] = buildRecordPositionQuery(
      { recordPositionQueryType: queryType },
      objectMetadataItem,
      dataSourceSchema,
    );

    expect(query).toEqual(
      `SELECT MAX(position) as position FROM ${dataSourceSchema}."${objectMetadataItem.nameSingular}"`,
    );
    expect(params).toEqual([]);
  });

  it('should return query and params for UPDATE_POSITION', async () => {
    const positionValue = 1;
    const recordId = '1';
    const queryType = RecordPositionQueryType.UPDATE_POSITION;
    const [query, params] = buildRecordPositionQuery(
      { positionValue, recordId, recordPositionQueryType: queryType },
      objectMetadataItem,
      dataSourceSchema,
    );

    expect(query).toEqual(
      `UPDATE ${dataSourceSchema}."${objectMetadataItem.nameSingular}"
            SET "position" = $1
            WHERE "id" = $2`,
    );
    expect(params).toEqual([positionValue, recordId]);
  });
});
