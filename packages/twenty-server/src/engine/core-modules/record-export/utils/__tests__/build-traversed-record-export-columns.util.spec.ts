import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildTraversedRecordExportColumns } from 'src/engine/core-modules/record-export/utils/build-traversed-record-export-columns.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const relationField = getFlatFieldMetadataMock({
  objectMetadataId: 'opportunity',
  universalIdentifier: 'company',
  type: FieldMetadataType.RELATION,
  name: 'company',
  label: 'Company',
  settings: { relationType: RelationType.MANY_TO_ONE },
});

describe('buildTraversedRecordExportColumns', () => {
  it('builds a single column for a scalar target field', () => {
    expect(
      buildTraversedRecordExportColumns({
        relationField,
        targetField: getFlatFieldMetadataMock({
          objectMetadataId: 'company',
          universalIdentifier: 'employees',
          type: FieldMetadataType.NUMBER,
          name: 'employees',
          label: 'Employees',
        }),
      }),
    ).toEqual([
      {
        relationFieldName: 'company',
        fieldName: 'employees',
        label: 'Company › Employees',
        type: FieldMetadataType.NUMBER,
      },
    ]);
  });

  it('expands a composite target field into one column per sub field', () => {
    expect(
      buildTraversedRecordExportColumns({
        relationField,
        targetField: getFlatFieldMetadataMock({
          objectMetadataId: 'company',
          universalIdentifier: 'annualRecurringRevenue',
          type: FieldMetadataType.CURRENCY,
          name: 'annualRecurringRevenue',
          label: 'ARR',
        }),
      }),
    ).toEqual([
      {
        relationFieldName: 'company',
        fieldName: 'annualRecurringRevenue',
        label: 'Company › ARR / Amount',
        type: FieldMetadataType.CURRENCY,
        subFieldName: 'amountMicros',
      },
      {
        relationFieldName: 'company',
        fieldName: 'annualRecurringRevenue',
        label: 'Company › ARR / Currency',
        type: FieldMetadataType.CURRENCY,
        subFieldName: 'currencyCode',
      },
    ]);
  });
});
