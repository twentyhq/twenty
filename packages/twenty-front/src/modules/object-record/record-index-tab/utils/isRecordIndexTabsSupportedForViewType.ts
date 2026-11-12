import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

const VIEW_TYPES_WITH_RECORD_INDEX_TABS: ViewType[] = [
  ViewType.TABLE,
  ViewType.LIST,
];

export const isRecordIndexTabsSupportedForViewType = (
  viewType: ViewType | undefined,
) =>
  isDefined(viewType) && VIEW_TYPES_WITH_RECORD_INDEX_TABS.includes(viewType);
