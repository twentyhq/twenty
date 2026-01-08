import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { getAllRecordFilterDescendantsOfRecordFilterGroup } from '@/object-record/record-filter/utils/getAllRecordFilterDescendantsOfRecordFilterGroup';

const MOCK_RECORD_FILTER_FIELDS: RecordFilter = {
  id: 'filter-1',
  recordFilterGroupId: 'root-group',
  fieldMetadataId: 'field-1',
  operand: RecordFilterOperand.CONTAINS,
  value: 'value-1',
  displayValue: 'Display Value 1',
  label: 'Label 1',
  type: 'TEXT',
};

describe('getAllRecordFilterDescendantsOfRecordFilterGroup', () => {
  it('should return an empty array if the recordFilterGroupId does not exist', () => {
    const recordFilterGroups: RecordFilterGroup[] = [];
    const recordFilters: RecordFilter[] = [];
    const recordFilterGroupId = 'nonexistent-id';

    const result = getAllRecordFilterDescendantsOfRecordFilterGroup({
      recordFilterGroupId,
      recordFilterGroups,
      recordFilters,
    });

    expect(result).toEqual([]);
  });

  it('should return all direct child record filters of the given recordFilterGroupId', () => {
    const recordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'root-group',
        parentRecordFilterGroupId: null,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
    ];

    const recordFiltersDescendants: RecordFilter[] = [
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-1',
        recordFilterGroupId: 'root-group',
      },
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-2',
        recordFilterGroupId: 'root-group',
      },
    ];

    const recordFilterGroupId = 'root-group';

    const result = getAllRecordFilterDescendantsOfRecordFilterGroup({
      recordFilterGroupId,
      recordFilterGroups,
      recordFilters: recordFiltersDescendants,
    });

    expect(result).toEqual(recordFiltersDescendants);
  });

  it('should return all descendant record filters recursively', () => {
    const recordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'root-group',
        parentRecordFilterGroupId: null,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
      {
        id: 'child-group-1',
        parentRecordFilterGroupId: 'root-group',
        logicalOperator: RecordFilterGroupLogicalOperator.OR,
      },
      {
        id: 'grand-child-group-1',
        parentRecordFilterGroupId: 'child-group-1',
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
      {
        id: 'grand-child-group-2',
        parentRecordFilterGroupId: 'child-group-1',
        logicalOperator: RecordFilterGroupLogicalOperator.OR,
      },
      {
        id: 'child-group-2',
        parentRecordFilterGroupId: 'root-group',
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
    ];

    const recordFiltersWithoutGroup: RecordFilter[] = [
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-1',
        recordFilterGroupId: undefined,
      },
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-2',
        recordFilterGroupId: undefined,
      },
    ];

    const recordFiltersDescendants: RecordFilter[] = [
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-3',
        recordFilterGroupId: 'root-group',
      },
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-4',
        recordFilterGroupId: 'child-group-1',
      },
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-5',
        recordFilterGroupId: 'child-group-2',
      },
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-6',
        recordFilterGroupId: 'grand-child-group-1',
      },
      {
        ...MOCK_RECORD_FILTER_FIELDS,
        id: 'filter-7',
        recordFilterGroupId: 'grand-child-group-2',
      },
    ];

    const combinedRecordFilters = [
      ...recordFiltersWithoutGroup,
      ...recordFiltersDescendants,
    ];

    const recordFilterGroupId = 'root-group';

    const allDescendantOfRootRecordFilterGroup =
      getAllRecordFilterDescendantsOfRecordFilterGroup({
        recordFilterGroupId,
        recordFilterGroups,
        recordFilters: combinedRecordFilters,
      });

    const result = [...allDescendantOfRootRecordFilterGroup].sort(
      sortByProperty('id'),
    );

    const expectedResult = [...recordFiltersDescendants].sort(
      sortByProperty('id'),
    );

    expect(result).toEqual(expectedResult);
  });

  it('should return an empty array if the group has no children', () => {
    const recordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'empty-group-id',
        parentRecordFilterGroupId: 'parent-group-id',
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 0,
      },
    ];

    const recordFilters: RecordFilter[] = [];

    const recordFilterGroupId = 'empty-group-id';

    const result = getAllRecordFilterDescendantsOfRecordFilterGroup({
      recordFilterGroupId,
      recordFilterGroups,
      recordFilters,
    });

    expect(result).toEqual([]);
  });
});
