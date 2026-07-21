import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { cloneRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/cloneRecordTableWidgetViewSnapshot';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  ViewFilterGroupLogicalOperator,
  ViewOpenRecordIn,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';

const SOURCE_VIEW_ID = 'source-view-id';
const PARENT_FILTER_GROUP_ID = 'parent-filter-group-id';
const CHILD_FILTER_GROUP_ID = 'child-filter-group-id';

const sourceSnapshot: RecordTableWidgetViewSnapshot = {
  view: {
    id: SOURCE_VIEW_ID,
    name: 'Companies Table',
    icon: 'IconTable',
    objectMetadataId: 'object-metadata-id',
    type: ViewType.TABLE_WIDGET,
    isCompact: false,
    position: 0,
    openRecordIn: ViewOpenRecordIn.RECORD_PAGE,
    visibility: ViewVisibility.WORKSPACE,
    shouldHideEmptyGroups: false,
    isActive: true,
  },
  viewFields: [
    {
      id: 'view-field-id',
      viewId: SOURCE_VIEW_ID,
      fieldMetadataId: 'field-metadata-id',
      position: 0,
      size: 180,
      isVisible: true,
      isActive: true,
    },
  ],
  viewFilterGroups: [
    {
      id: PARENT_FILTER_GROUP_ID,
      viewId: SOURCE_VIEW_ID,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
      parentViewFilterGroupId: null,
      positionInViewFilterGroup: null,
    },
    {
      id: CHILD_FILTER_GROUP_ID,
      viewId: SOURCE_VIEW_ID,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
      parentViewFilterGroupId: PARENT_FILTER_GROUP_ID,
      positionInViewFilterGroup: 0,
    },
  ],
  viewFilters: [
    {
      id: 'view-filter-id',
      viewId: SOURCE_VIEW_ID,
      fieldMetadataId: 'field-metadata-id',
      operand: ViewFilterOperand.IS,
      value: 'Acme',
      viewFilterGroupId: CHILD_FILTER_GROUP_ID,
      positionInViewFilterGroup: 0,
      subFieldName: null,
    },
  ],
  viewSorts: [
    {
      id: 'view-sort-id',
      viewId: SOURCE_VIEW_ID,
      fieldMetadataId: 'field-metadata-id',
      direction: ViewSortDirection.ASC,
    },
  ],
  viewGroups: [
    {
      id: 'view-group-id',
      viewId: SOURCE_VIEW_ID,
      fieldValue: 'OPTION_1',
      position: 0,
      isVisible: true,
    },
  ],
};

describe('cloneRecordTableWidgetViewSnapshot', () => {
  it('should assign a new view id and re-point every nested viewId to it', () => {
    const clonedSnapshot = cloneRecordTableWidgetViewSnapshot(sourceSnapshot);

    expect(clonedSnapshot.view.id).not.toBe(SOURCE_VIEW_ID);

    const newViewId = clonedSnapshot.view.id;

    expect(clonedSnapshot.viewFields[0].viewId).toBe(newViewId);
    expect(clonedSnapshot.viewFilterGroups[0].viewId).toBe(newViewId);
    expect(clonedSnapshot.viewFilters[0].viewId).toBe(newViewId);
    expect(clonedSnapshot.viewSorts[0].viewId).toBe(newViewId);
    expect(clonedSnapshot.viewGroups[0].viewId).toBe(newViewId);
  });

  it('should regenerate row ids so the duplicate persists without colliding with the source', () => {
    const clonedSnapshot = cloneRecordTableWidgetViewSnapshot(sourceSnapshot);

    expect(clonedSnapshot.viewFields[0].id).not.toBe('view-field-id');
    expect(clonedSnapshot.viewFilters[0].id).not.toBe('view-filter-id');
    expect(clonedSnapshot.viewSorts[0].id).not.toBe('view-sort-id');
    expect(clonedSnapshot.viewGroups[0].id).not.toBe('view-group-id');
    expect(clonedSnapshot.viewFilterGroups[0].id).not.toBe(
      PARENT_FILTER_GROUP_ID,
    );
    expect(clonedSnapshot.viewFilterGroups[1].id).not.toBe(
      CHILD_FILTER_GROUP_ID,
    );
  });

  it('should re-point filter-group references to the regenerated group ids', () => {
    const clonedSnapshot = cloneRecordTableWidgetViewSnapshot(sourceSnapshot);

    const [parentGroup, childGroup] = clonedSnapshot.viewFilterGroups;

    expect(childGroup.parentViewFilterGroupId).toBe(parentGroup.id);
    expect(clonedSnapshot.viewFilters[0].viewFilterGroupId).toBe(childGroup.id);
  });

  it('should preserve group content', () => {
    const clonedSnapshot = cloneRecordTableWidgetViewSnapshot(sourceSnapshot);

    expect(clonedSnapshot.viewGroups[0]).toMatchObject({
      fieldValue: 'OPTION_1',
      position: 0,
      isVisible: true,
    });
  });

  it('should preserve filter, sort and field content', () => {
    const clonedSnapshot = cloneRecordTableWidgetViewSnapshot(sourceSnapshot);

    expect(clonedSnapshot.viewFilters[0]).toMatchObject({
      fieldMetadataId: 'field-metadata-id',
      operand: ViewFilterOperand.IS,
      value: 'Acme',
    });
    expect(clonedSnapshot.viewSorts[0]).toMatchObject({
      fieldMetadataId: 'field-metadata-id',
      direction: ViewSortDirection.ASC,
    });
    expect(clonedSnapshot.viewFields[0]).toMatchObject({
      fieldMetadataId: 'field-metadata-id',
      position: 0,
      size: 180,
    });
  });
});
