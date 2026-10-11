import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { dehydrateRecordFilters } from '@/object-record/record-filter/utils/dehydrateRecordFilters';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('dehydrateRecordFilters', () => {
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

    expect(dehydrateRecordFilters([recordFilter])).toEqual([
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
