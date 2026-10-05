import { ViewType } from '@/views/types/ViewType';

// Kanban and calendar layouts are their grouping; flat layouts must keep offering none.
const VIEW_TYPES_WITH_OPTIONAL_RECORD_GROUPING: ViewType[] = [
  ViewType.TABLE,
  ViewType.LIST,
];

export const isRecordGroupingOptionalForViewType = (viewType: ViewType) =>
  VIEW_TYPES_WITH_OPTIONAL_RECORD_GROUPING.includes(viewType);
