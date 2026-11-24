import { getRollupFilterForFieldMetadataItem } from '@/settings/data-model/fields/forms/rollup/utils/getRollupFilterForFieldMetadataItem';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

describe('getRollupFilterForFieldMetadataItem', () => {
  it('should start a select filter on its first option', () => {
    expect(
      getRollupFilterForFieldMetadataItem({
        filterId: 'filter-id',
        fieldMetadataItem: {
          id: 'stage-id',
          type: FieldMetadataType.SELECT,
          settings: null,
          options: [
            { id: '1', label: 'New', value: 'NEW', color: 'blue', position: 0 },
          ],
        },
      }),
    ).toEqual({
      id: 'filter-id',
      fieldMetadataId: 'stage-id',
      operand: ViewFilterOperand.IS,
      value: '["NEW"]',
    });
  });

  it('should start a boolean filter on true', () => {
    expect(
      getRollupFilterForFieldMetadataItem({
        filterId: 'filter-id',
        fieldMetadataItem: {
          id: 'done-id',
          type: FieldMetadataType.BOOLEAN,
          settings: null,
          options: null,
        },
      }),
    ).toMatchObject({ operand: ViewFilterOperand.IS, value: 'true' });
  });

  it('should start a number filter empty', () => {
    expect(
      getRollupFilterForFieldMetadataItem({
        filterId: 'filter-id',
        fieldMetadataItem: {
          id: 'amount-id',
          type: FieldMetadataType.NUMBER,
          settings: null,
          options: null,
        },
      }),
    ).toMatchObject({ operand: ViewFilterOperand.IS, value: '' });
  });
});
