import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

describe('mapViewFilterGroupsToRecordFilterGroups', () => {
  it('should map empty array to empty array', () => {
    expect(mapViewFilterGroupsToRecordFilterGroups([])).toEqual([]);
  });

  it('should map correctly for single group', () => {
    const viewFilterGroups: ViewFilterGroup[] = [
      {
        id: 'filter-group-1',
        parentViewFilterGroupId: null,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 0,
        viewId: 'view-1',
        __typename: 'ViewFilterGroup',
      },
    ];

    const expectedRecordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'filter-group-1',
        parentRecordFilterGroupId: null,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 0,
      },
    ];

    expect(mapViewFilterGroupsToRecordFilterGroups(viewFilterGroups)).toEqual(
      expectedRecordFilterGroups,
    );
  });

  it('should map correctly for view filter groups with a parent', () => {
    const viewFilterGroups: ViewFilterGroup[] = [
      {
        id: 'filter-group-parent-1',
        parentViewFilterGroupId: null,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
        positionInViewFilterGroup: 0,
        viewId: 'view-1',
        __typename: 'ViewFilterGroup',
      },
      {
        id: 'filter-group-child-1',
        parentViewFilterGroupId: 'filter-group-parent-1',
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 1,
        viewId: 'view-1',
        __typename: 'ViewFilterGroup',
      },
      {
        id: 'filter-group-child-2',
        parentViewFilterGroupId: 'filter-group-parent-1',
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 2,
        viewId: 'view-1',
        __typename: 'ViewFilterGroup',
      },
    ];

    const expectedRecordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'filter-group-parent-1',
        parentRecordFilterGroupId: null,
        logicalOperator: RecordFilterGroupLogicalOperator.OR,
        positionInRecordFilterGroup: 0,
      },
      {
        id: 'filter-group-child-1',
        parentRecordFilterGroupId: 'filter-group-parent-1',
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 1,
      },
      {
        id: 'filter-group-child-2',
        parentRecordFilterGroupId: 'filter-group-parent-1',
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 2,
      },
    ];

    expect(mapViewFilterGroupsToRecordFilterGroups(viewFilterGroups)).toEqual(
      expectedRecordFilterGroups,
    );
  });
});
