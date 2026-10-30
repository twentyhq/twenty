import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { mapRecordFiltersToPersistedRecordFilters } from '@/object-record/record-filter/utils/mapRecordFiltersToPersistedRecordFilters';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('mapRecordFiltersToPersistedRecordFilters', () => {
  it('should keep field references and drop properties derived from field metadata', () => {
    const recordFilter: RecordFilter = {
      id: 'filter-id',
      fieldMetadataId: 'company-field-id',
      relationTargetFieldMetadataId: 'name-field-id',
      operand: ViewFilterOperand.CONTAINS,
      value: 'Acme',
      displayValue: 'Acme',
      displayAvatarUrl: 'https://example.com/avatar.png',
      type: 'TEXT',
      label: 'Company → Name',
      recordFilterGroupId: 'group-id',
      positionInRecordFilterGroup: 1,
    };

    expect(mapRecordFiltersToPersistedRecordFilters([recordFilter])).toEqual([
      {
        id: 'filter-id',
        fieldMetadataId: 'company-field-id',
        relationTargetFieldMetadataId: 'name-field-id',
        operand: ViewFilterOperand.CONTAINS,
        value: 'Acme',
        recordFilterGroupId: 'group-id',
        positionInRecordFilterGroup: 1,
        subFieldName: undefined,
      },
    ]);
  });
});
