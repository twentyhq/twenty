import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type View } from '@/views/types/View';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const mockObjectMetadataItemNameSingular = 'company';

describe('mapRecordFilterGroupToViewFilterGroup', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  const mockView: View = {
    id: 'view-1',
    name: 'Test View',
    objectMetadataId: mockObjectMetadataItem.id,
    viewFilters: [],
    viewFilterGroups: [],
    type: ViewType.Table,
    key: null,
    isCompact: false,
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    viewFields: [],
    viewGroups: [],
    viewSorts: [],
    mainGroupByFieldMetadataId: '',
    shouldHideEmptyGroups: false,
    kanbanAggregateOperation: AggregateOperations.COUNT,
    icon: '',
    kanbanAggregateOperationFieldMetadataId: '',
    position: 0,
    visibility: ViewVisibility.WORKSPACE,
    __typename: 'View',
  };

  it('should correctly map single record filter group', () => {
    const recordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'filter-group-1',
        parentRecordFilterGroupId: null,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 0,
      },
    ];

    const expectedViewFilterGroups: ViewFilterGroup[] = [
      {
        id: 'filter-group-1',
        parentViewFilterGroupId: null,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 0,
        viewId: 'view-1',
        __typename: 'ViewFilterGroup',
      },
    ];

    const mappedRecordFilterGroups = recordFilterGroups.map(
      (recordFilterGroup) =>
        mapRecordFilterGroupToViewFilterGroup({
          recordFilterGroup,
          view: mockView,
        }),
    );

    expect(mappedRecordFilterGroups).toEqual(expectedViewFilterGroups);
  });

  it('should correctly map multiple record filter groups with a parent', () => {
    const recordFilterGroups: RecordFilterGroup[] = [
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

    const expectedViewFilterGroups: ViewFilterGroup[] = [
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

    const mappedRecordFilterGroups = recordFilterGroups.map(
      (recordFilterGroup) =>
        mapRecordFilterGroupToViewFilterGroup({
          recordFilterGroup,
          view: mockView,
        }),
    );

    expect(mappedRecordFilterGroups).toEqual(expectedViewFilterGroups);
  });
});
