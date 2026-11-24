import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { getFormulaAggregateConditionForFieldMetadataItem } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateConditionForFieldMetadataItem';

describe('getFormulaAggregateConditionForFieldMetadataItem', () => {
  it('should start a select condition on its first option', () => {
    expect(
      getFormulaAggregateConditionForFieldMetadataItem({
        conditionId: 'condition-id',
        fieldMetadataItem: {
          name: 'stage',
          type: FieldMetadataType.SELECT,
          options: [
            { id: '1', label: 'New', value: 'NEW', color: 'blue', position: 0 },
          ],
        },
      }),
    ).toEqual({
      id: 'condition-id',
      fieldName: 'stage',
      operand: ViewFilterOperand.IS,
      value: 'NEW',
    });
  });

  it('should start a multi-select condition with contains', () => {
    expect(
      getFormulaAggregateConditionForFieldMetadataItem({
        conditionId: 'condition-id',
        fieldMetadataItem: {
          name: 'labels',
          type: FieldMetadataType.MULTI_SELECT,
          options: [],
        },
      }),
    ).toMatchObject({ operand: ViewFilterOperand.CONTAINS, value: '' });
  });

  it('should start a boolean condition on true', () => {
    expect(
      getFormulaAggregateConditionForFieldMetadataItem({
        conditionId: 'condition-id',
        fieldMetadataItem: {
          name: 'isUrgent',
          type: FieldMetadataType.BOOLEAN,
          options: null,
        },
      }),
    ).toMatchObject({ operand: ViewFilterOperand.IS, value: 'true' });
  });

  it('should start a number condition empty', () => {
    expect(
      getFormulaAggregateConditionForFieldMetadataItem({
        conditionId: 'condition-id',
        fieldMetadataItem: {
          name: 'estimate',
          type: FieldMetadataType.NUMBER,
          options: null,
        },
      }),
    ).toMatchObject({ operand: ViewFilterOperand.IS, value: '' });
  });
});
