import {
  FieldMetadataType,
  type ObjectRecord,
  OrderByDirection,
} from 'twenty-shared/types';

import { buildDateTimeCursorValueSelects } from 'src/engine/api/utils/build-date-time-cursor-value-selects.util';
import { buildOrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

const buildFieldMetadata = (
  name: string,
  type: FieldMetadataType,
): OrmFlatFieldMetadata => ({ name, type }) as OrmFlatFieldMetadata;

const buildScalarLeaf = (
  name: string,
  type: FieldMetadataType,
): OrderByLeaf => ({
  kind: 'scalar',
  path: [name],
  direction: OrderByDirection.AscNullsLast,
  fieldMetadata: buildFieldMetadata(name, type),
});

const companyCreatedAtLeaf: OrderByLeaf = {
  kind: 'relation',
  path: ['company', 'createdAt'],
  direction: OrderByDirection.AscNullsLast,
  fieldMetadata: buildFieldMetadata('company', FieldMetadataType.RELATION),
  targetFieldMetadata: buildFieldMetadata(
    'createdAt',
    FieldMetadataType.DATE_TIME,
  ),
};

describe('buildDateTimeCursorValueSelects', () => {
  it('should render root and relation DATE_TIME leaves at microsecond precision in UTC', () => {
    const selects = buildDateTimeCursorValueSelects({
      orderByLeaves: [
        buildScalarLeaf('closeDate', FieldMetadataType.DATE_TIME),
        companyCreatedAtLeaf,
        buildScalarLeaf('id', FieldMetadataType.UUID),
      ],
      objectNameSingular: 'opportunity',
    });

    expect(selects).toEqual([
      {
        expression: `to_char("opportunity"."closeDate" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
        alias: 'opportunity_closeDate_cursor',
      },
      {
        expression: `to_char("company"."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
        alias: 'company_createdAt_cursor',
      },
    ]);
  });

  it('should keep long aliases within the Postgres identifier limit and read them back', () => {
    const objectNameSingular = 'aVeryLongCustomObjectNameSingularForCursors';
    const fieldName = 'anotherVeryLongDateTimeFieldNameForCursors';

    const [select] = buildDateTimeCursorValueSelects({
      orderByLeaves: [buildScalarLeaf(fieldName, FieldMetadataType.DATE_TIME)],
      objectNameSingular,
    });

    expect(select.alias.length).toBeLessThanOrEqual(63);
    expect(
      buildOrderByValuesByRecordId({
        orderByLeaves: [
          buildScalarLeaf(fieldName, FieldMetadataType.DATE_TIME),
        ],
        records: [{ id: 'record-1' }] as ObjectRecord[],
        rawRows: [
          {
            [`${objectNameSingular}_id`]: 'record-1',
            [select.alias]: '2026-01-01T00:00:00.123900Z',
          },
        ],
        objectNameSingular,
      }),
    ).toEqual({
      'record-1': { [fieldName]: '2026-01-01T00:00:00.123900Z' },
    });
  });
});
