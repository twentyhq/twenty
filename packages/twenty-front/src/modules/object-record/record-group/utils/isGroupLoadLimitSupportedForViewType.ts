import { ViewType } from '@/views/types/ViewType';

// Only these layouts page their groups through useFindManyRecordIndexTableParams.
// A board pages on RECORD_BOARD_QUERY_PAGE_SIZE, which also drives its
// end-of-list detection, so the per-view load limit would not reach it.
const VIEW_TYPES_WITH_GROUP_LOAD_LIMIT: ViewType[] = [
  ViewType.TABLE,
  ViewType.LIST,
];

export const isGroupLoadLimitSupportedForViewType = (viewType: ViewType) =>
  VIEW_TYPES_WITH_GROUP_LOAD_LIMIT.includes(viewType);
