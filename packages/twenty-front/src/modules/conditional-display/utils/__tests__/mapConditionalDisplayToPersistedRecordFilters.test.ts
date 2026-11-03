import { mapConditionalDisplayToPersistedRecordFilters } from '@/conditional-display/utils/mapConditionalDisplayToPersistedRecordFilters';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('mapConditionalDisplayToPersistedRecordFilters', () => {
  it('maps context rows onto their virtual field and keeps field rows for the editor', () => {
    expect(
      mapConditionalDisplayToPersistedRecordFilters({
        recordFilters: [
          {
            id: 'role-filter',
            contextKey: 'currentRoleId',
            operand: ViewFilterOperand.IS,
            value: JSON.stringify(['admin-role-id']),
          },
          {
            id: 'name-filter',
            fieldMetadataId: 'name-field-id',
            operand: ViewFilterOperand.CONTAINS,
            value: 'Air',
            recordFilterGroupId: 'root',
          },
        ],
      }),
    ).toEqual([
      {
        id: 'role-filter',
        fieldMetadataId: 'currentRoleId',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['admin-role-id']),
        recordFilterGroupId: undefined,
        positionInRecordFilterGroup: undefined,
        subFieldName: null,
        relationTargetFieldMetadataId: undefined,
      },
      {
        id: 'name-filter',
        fieldMetadataId: 'name-field-id',
        operand: ViewFilterOperand.CONTAINS,
        value: 'Air',
        recordFilterGroupId: 'root',
        positionInRecordFilterGroup: undefined,
        subFieldName: null,
        relationTargetFieldMetadataId: undefined,
      },
    ]);
  });
});
