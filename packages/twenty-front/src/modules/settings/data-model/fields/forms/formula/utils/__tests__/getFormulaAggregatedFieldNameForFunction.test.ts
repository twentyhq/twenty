import { FieldMetadataType } from 'twenty-shared/types';

import { getFormulaAggregatedFieldNameForFunction } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregatedFieldNameForFunction';

const RELATED_FIELDS = [
  {
    name: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
    isActive: true,
    isSystem: false,
    settings: null,
  },
  {
    name: 'probability',
    type: FieldMetadataType.NUMBER,
    isActive: true,
    isSystem: false,
    settings: null,
  },
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    isActive: true,
    isSystem: false,
    settings: null,
  },
];

describe('getFormulaAggregatedFieldNameForFunction', () => {
  it('should clear the field for a count', () => {
    expect(
      getFormulaAggregatedFieldNameForFunction({
        functionName: 'count',
        fieldType: FieldMetadataType.NUMBER,
        currentAggregatedFieldName: 'amount',
        relatedFieldMetadataItems: RELATED_FIELDS,
      }),
    ).toBeUndefined();
  });

  it('should keep the current field when it still fits the calculation', () => {
    expect(
      getFormulaAggregatedFieldNameForFunction({
        functionName: 'avg',
        fieldType: FieldMetadataType.NUMBER,
        currentAggregatedFieldName: 'amount',
        relatedFieldMetadataItems: RELATED_FIELDS,
      }),
    ).toBe('amount');
  });

  it('should fall back to the first field fitting the calculation', () => {
    expect(
      getFormulaAggregatedFieldNameForFunction({
        functionName: 'sum',
        fieldType: FieldMetadataType.NUMBER,
        currentAggregatedFieldName: 'closeDate',
        relatedFieldMetadataItems: RELATED_FIELDS,
      }),
    ).toBe('probability');
    expect(
      getFormulaAggregatedFieldNameForFunction({
        functionName: 'max',
        fieldType: FieldMetadataType.DATE_TIME,
        relatedFieldMetadataItems: RELATED_FIELDS,
      }),
    ).toBe('closeDate');
  });
});
