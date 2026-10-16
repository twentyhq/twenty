import { removeEmptyRecordFilterGroups } from '@/object-record/record-filter-group/utils/removeEmptyRecordFilterGroups';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

const rootRecordFilterGroup = {
  id: 'root-group-id',
  logicalOperator: RecordFilterGroupLogicalOperator.OR,
};

const childRecordFilterGroup = {
  id: 'child-group-id',
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
  parentRecordFilterGroupId: rootRecordFilterGroup.id,
};

describe('removeEmptyRecordFilterGroups', () => {
  it('should keep groups that hold a filter or a non-empty child group', () => {
    const recordFilterGroups = [rootRecordFilterGroup, childRecordFilterGroup];

    expect(
      removeEmptyRecordFilterGroups({
        recordFilters: [{ recordFilterGroupId: childRecordFilterGroup.id }],
        recordFilterGroups,
      }),
    ).toBe(recordFilterGroups);
  });

  it('should remove a group left without filters, then its parent if it becomes empty', () => {
    expect(
      removeEmptyRecordFilterGroups({
        recordFilters: [],
        recordFilterGroups: [rootRecordFilterGroup, childRecordFilterGroup],
      }),
    ).toEqual([]);
  });

  it('should keep the parent when it still holds a filter', () => {
    expect(
      removeEmptyRecordFilterGroups({
        recordFilters: [{ recordFilterGroupId: rootRecordFilterGroup.id }],
        recordFilterGroups: [rootRecordFilterGroup, childRecordFilterGroup],
      }),
    ).toEqual([rootRecordFilterGroup]);
  });
});
