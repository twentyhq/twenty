import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { findDuplicateRecordFilterInNonAdvancedRecordFilters } from '@/object-record/record-filter/utils/findDuplicateRecordFilterInNonAdvancedRecordFilters';
import { ViewFilterOperand } from 'twenty-shared/types';

const createFilter = (
  id: string,
  relationTargetFieldMetadataId?: string,
): RecordFilter => ({
  id,
  fieldMetadataId: 'fellowships-field-id',
  relationTargetFieldMetadataId,
  operand: ViewFilterOperand.IS,
  displayValue: '',
  label: 'Fellowships',
  type: 'RELATION',
  value: '',
});

describe('findDuplicateRecordFilterInNonAdvancedRecordFilters', () => {
  const directRelationFilter = createFilter('direct-filter');
  const cohortFilter = createFilter('cohort-filter', 'cohort-field-id');
  const statusFilter = createFilter('status-filter', 'status-field-id');
  const recordFilters = [directRelationFilter, cohortFilter, statusFilter];

  it('distinguishes a direct relation filter from relation target filters', () => {
    expect(
      findDuplicateRecordFilterInNonAdvancedRecordFilters({
        recordFilters,
        fieldMetadataItemId: 'fellowships-field-id',
      }),
    ).toBe(directRelationFilter);
  });

  it('distinguishes separate target fields on the same relation', () => {
    expect(
      findDuplicateRecordFilterInNonAdvancedRecordFilters({
        recordFilters,
        fieldMetadataItemId: 'fellowships-field-id',
        relationTargetFieldMetadataId: 'status-field-id',
      }),
    ).toBe(statusFilter);
  });
});
