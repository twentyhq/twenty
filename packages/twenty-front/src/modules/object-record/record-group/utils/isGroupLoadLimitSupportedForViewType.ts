import { ViewType } from '@/views/types/ViewType';
import { getViewLayoutFromViewType } from 'twenty-shared/utils';

type ViewTypeValue = `${ViewType}`;

// Boards page on RECORD_BOARD_QUERY_PAGE_SIZE, so the limit cannot reach them
const VIEW_LAYOUTS_WITH_GROUP_LOAD_LIMIT: ViewTypeValue[] = [
  ViewType.TABLE,
  ViewType.LIST,
];

// Widget views keep their own type, so this matches on layout, not type
export const isGroupLoadLimitSupportedForViewType = (viewType: ViewType) =>
  VIEW_LAYOUTS_WITH_GROUP_LOAD_LIMIT.includes(
    getViewLayoutFromViewType(viewType),
  );
