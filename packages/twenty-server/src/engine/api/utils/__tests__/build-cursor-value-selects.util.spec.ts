import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { buildCursorValueSelects } from 'src/engine/api/utils/build-cursor-value-selects.util';
import { buildOrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

const buildScalarLeaf = (
  name: string,
  type: FieldMetadataType,
): OrderByLeaf<Pick<OrmFlatFieldMetadata, 'type'>> => ({
  kind: 'scalar',
  path: [name],
  direction: OrderByDirection.AscNullsLast,
  fieldMetadata: { type },
});

const companyCreatedAtLeaf: OrderByLeaf<Pick<OrmFlatFieldMetadata, 'type'>> = {
  kind: 'relation',
  path: ['company', 'createdAt'],
  direction: OrderByDirection.AscNullsLast,
  fieldMetadata: { type: FieldMetadataType.RELATION },
  targetFieldMetadata: { type: FieldMetadataType.DATE_TIME },
};

describe('buildCursorValueSelects', () => {
  it('should render root and relation DATE_TIME leaves at microsecond precision in UTC', () => {
    const selects = buildCursorValueSelects({
      orderByLeaves: [
        buildScalarLeaf('closeDate', FieldMetadataType.DATE_TIME),
        companyCreatedAtLeaf,
        buildScalarLeaf('id', FieldMetadataType.UUID),
      ],
      objectNameSingular: 'opportunity',
      columnsToSelect: { id: true, closeDate: true },
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

  it('should select missing root and relation cursor columns without duplicating selected root columns', () => {
    const selects = buildCursorValueSelects({
      orderByLeaves: [
        buildScalarLeaf('name', FieldMetadataType.TEXT),
        buildScalarLeaf('employees', FieldMetadataType.NUMBER),
        {
          kind: 'relation',
          path: ['company', 'name'],
          direction: OrderByDirection.AscNullsLast,
          fieldMetadata: { type: FieldMetadataType.RELATION },
          targetFieldMetadata: { type: FieldMetadataType.TEXT },
        },
        buildScalarLeaf('id', FieldMetadataType.UUID),
      ],
      objectNameSingular: 'opportunity',
      columnsToSelect: { id: true, name: true, employees: false },
    });

    expect(selects).toEqual([
      {
        expression: '"opportunity"."employees"',
        alias: 'opportunity_employees',
      },
      {
        expression: '"company"."name"',
        alias: 'company_name',
      },
    ]);
  });

  it.each([
    {
      fieldType: FieldMetadataType.DATE_TIME,
      cursorValue: '2026-01-01T00:00:00.123900Z',
    },
    { fieldType: FieldMetadataType.TEXT, cursorValue: 'Acme' },
  ])(
    'should keep long $fieldType aliases within the Postgres identifier limit and read them back',
    ({ fieldType, cursorValue }) => {
      const objectNameSingular = 'aVeryLongCustomObjectNameSingularForCursors';
      const fieldName = 'anotherVeryLongDateTimeFieldNameForCursors';

      const [select] = buildCursorValueSelects({
        orderByLeaves: [buildScalarLeaf(fieldName, fieldType)],
        objectNameSingular,
        columnsToSelect: {},
      });

      expect(select.alias.length).toBeLessThanOrEqual(63);
      expect(
        buildOrderByValuesByRecordId({
          orderByLeaves: [buildScalarLeaf(fieldName, fieldType)],
          records: [{ id: 'record-1' }],
          rawRows: [
            {
              [`${objectNameSingular}_id`]: 'record-1',
              [select.alias]: cursorValue,
            },
          ],
          objectNameSingular,
        }),
      ).toEqual({
        'record-1': { [fieldName]: cursorValue },
      });
    },
  );
});
