import { FieldMetadataType } from 'twenty-shared/types';

import { getFormulaAggregateFilterableFieldMetadataItems } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateFilterableFieldMetadataItems';

const buildField = ({
  name,
  type,
  isActive = true,
  isSystem = false,
}: {
  name: string;
  type: FieldMetadataType;
  isActive?: boolean;
  isSystem?: boolean;
}) => ({ name, type, isActive, isSystem, settings: null });

describe('getFormulaAggregateFilterableFieldMetadataItems', () => {
  it('should offer the active fields a condition can compare', () => {
    expect(
      getFormulaAggregateFilterableFieldMetadataItems([
        buildField({ name: 'title', type: FieldMetadataType.TEXT }),
        buildField({ name: 'status', type: FieldMetadataType.SELECT }),
        buildField({ name: 'labels', type: FieldMetadataType.MULTI_SELECT }),
        buildField({ name: 'isUrgent', type: FieldMetadataType.BOOLEAN }),
        buildField({ name: 'estimate', type: FieldMetadataType.NUMBER }),
        buildField({ name: 'dueAt', type: FieldMetadataType.DATE_TIME }),
        buildField({ name: 'amount', type: FieldMetadataType.CURRENCY }),
        buildField({
          name: 'position',
          type: FieldMetadataType.NUMBER,
          isSystem: true,
        }),
        buildField({
          name: 'legacy',
          type: FieldMetadataType.TEXT,
          isActive: false,
        }),
      ]).map(({ name }) => name),
    ).toEqual(['title', 'status', 'labels', 'isUrgent', 'estimate']);
  });
});
