import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const SAVED_VIEW: View = {
  id: 'view-1',
  name: 'Opportunities',
  objectMetadataId: 'object-metadata-id',
  viewFilters: [
    {
      id: 'saved-view-filter',
      fieldMetadataId: 'saved-field-id',
      operand: ViewFilterOperand.IS_AFTER,
      value: '2026-01-01',
    },
  ],
  viewFilterGroups: [],
  type: ViewType.TABLE_WIDGET,
  key: null,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewSorts: [],
  mainGroupByFieldMetadataId: '',
  shouldHideEmptyGroups: false,
  groupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
  kanbanAggregateOperation: AggregateOperations.COUNT,
  icon: 'IconTable',
  kanbanAggregateOperationFieldMetadataId: '',
  position: 0,
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
};

export const DRAFT_VIEW_SNAPSHOT: RecordTableWidgetViewSnapshot = {
  view: {
    id: 'view-1',
    name: 'Opportunities',
    icon: 'IconTable',
    objectMetadataId: 'object-metadata-id',
    type: ViewType.TABLE_WIDGET,
    isCompact: false,
    position: 0,
    visibility: ViewVisibility.WORKSPACE,
    shouldHideEmptyGroups: false,
    isActive: true,
  },
  viewFields: [],
  viewFilters: [
    {
      id: 'draft-view-filter',
      viewId: 'view-1',
      fieldMetadataId: 'draft-field-id',
      operand: ViewFilterOperand.IS_AFTER,
      value: '2026-01-01',
      viewFilterGroupId: null,
      positionInViewFilterGroup: null,
      subFieldName: null,
    },
  ],
  viewFilterGroups: [],
  viewSorts: [],
  viewGroups: [],
};
