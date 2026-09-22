import { ViewType } from '@/views/types/ViewType';
import { getViewLayoutFromViewType } from 'twenty-shared/utils';

type ViewTypeValue = `${ViewType}`;

// Only these layouts page their groups through useFindManyRecordIndexTableParams.
// A board pages on RECORD_BOARD_QUERY_PAGE_SIZE, which also drives its
// end-of-list detection, so the per-view load limit would not reach it.
const VIEW_LAYOUTS_WITH_GROUP_LOAD_LIMIT: ViewTypeValue[] = [
  ViewType.TABLE,
  ViewType.LIST,
];

// A widget view keeps its own type (TABLE_WIDGET, LIST_WIDGET, ...) while
// rendering the same table or list, so the layout decides here, not the type.
export const isGroupLoadLimitSupportedForViewType = (viewType: ViewType) =>
  VIEW_LAYOUTS_WITH_GROUP_LOAD_LIMIT.includes(
    getViewLayoutFromViewType(viewType),
  );
