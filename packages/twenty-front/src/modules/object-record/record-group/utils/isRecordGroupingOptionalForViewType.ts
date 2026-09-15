import { ViewType } from '@/views/types/ViewType';

// A kanban board is its groups and a calendar is its dates, so those layouts
// cannot drop their grouping; the layouts that render a flat run of records can,
// and must keep offering the way back to none.
const VIEW_TYPES_WITH_OPTIONAL_RECORD_GROUPING: ViewType[] = [
  ViewType.TABLE,
  ViewType.LIST,
];

export const isRecordGroupingOptionalForViewType = (viewType: ViewType) =>
  VIEW_TYPES_WITH_OPTIONAL_RECORD_GROUPING.includes(viewType);
