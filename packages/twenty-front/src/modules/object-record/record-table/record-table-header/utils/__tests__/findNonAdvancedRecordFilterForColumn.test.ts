import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { findNonAdvancedRecordFilterForColumn } from '@/object-record/record-table/record-table-header/utils/findNonAdvancedRecordFilterForColumn';
import { ViewFilterOperand } from 'twenty-shared/types';

const buildRecordFilter = (
  recordFilter: Pick<RecordFilter, 'id'> & Partial<RecordFilter>,
): RecordFilter => ({
  fieldMetadataId: 'company',
  value: '',
  displayValue: '',
  type: 'TEXT',
  operand: ViewFilterOperand.CONTAINS,
  label: '',
  ...recordFilter,
});

const relationFilter = buildRecordFilter({ id: 'relation', type: 'RELATION' });
const nameFilter = buildRecordFilter({
  id: 'name',
  relationTargetFieldMetadataId: 'company-name',
});
const employeesFilter = buildRecordFilter({
  id: 'employees',
  relationTargetFieldMetadataId: 'company-employees',
});
const groupedNameFilter = buildRecordFilter({
  id: 'grouped-name',
  relationTargetFieldMetadataId: 'company-name',
  recordFilterGroupId: 'group',
});

const recordFilters = [
  groupedNameFilter,
  relationFilter,
  nameFilter,
  employeesFilter,
];

describe('findNonAdvancedRecordFilterForColumn', () => {
  it('finds the relation column filter, not a lookup filter on the same relation', () => {
    expect(
      findNonAdvancedRecordFilterForColumn({
        recordFilters,
        fieldMetadataItemId: 'company',
        relationTargetFieldMetadataId: undefined,
      }),
    ).toBe(relationFilter);
  });

  it('finds the filter of the matching lookup target, skipping advanced filters', () => {
    expect(
      findNonAdvancedRecordFilterForColumn({
        recordFilters,
        fieldMetadataItemId: 'company',
        relationTargetFieldMetadataId: 'company-name',
      }),
    ).toBe(nameFilter);
    expect(
      findNonAdvancedRecordFilterForColumn({
        recordFilters,
        fieldMetadataItemId: 'company',
        relationTargetFieldMetadataId: 'company-employees',
      }),
    ).toBe(employeesFilter);
  });

  it('finds nothing when no filter matches the lookup target', () => {
    expect(
      findNonAdvancedRecordFilterForColumn({
        recordFilters: [relationFilter, groupedNameFilter],
        fieldMetadataItemId: 'company',
        relationTargetFieldMetadataId: 'company-name',
      }),
    ).toBeUndefined();
  });
});
