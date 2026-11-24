import { FieldMetadataType } from 'twenty-shared/types';

import { getFormulaAggregateFunctionNamesForFieldType } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateFunctionNamesForFieldType';

describe('getFormulaAggregateFunctionNamesForFieldType', () => {
  it('should offer every calculation to a number field', () => {
    expect(
      getFormulaAggregateFunctionNamesForFieldType(FieldMetadataType.NUMBER),
    ).toEqual(['count', 'sum', 'avg', 'min', 'max']);
  });

  it.each([FieldMetadataType.DATE, FieldMetadataType.DATE_TIME])(
    'should offer min and max to a %s field',
    (fieldType) => {
      expect(getFormulaAggregateFunctionNamesForFieldType(fieldType)).toEqual([
        'min',
        'max',
      ]);
    },
  );

  it.each([
    FieldMetadataType.TEXT,
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.CURRENCY,
  ])('should offer nothing to a %s field', (fieldType) => {
    expect(getFormulaAggregateFunctionNamesForFieldType(fieldType)).toEqual([]);
  });
});
