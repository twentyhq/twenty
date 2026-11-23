import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

const VIEW_TYPES_WITH_RECORD_GROUP_TABS: ViewType[] = [
  ViewType.TABLE,
  ViewType.LIST,
];

export const isRecordGroupTabsSupportedForViewType = (
  viewType: ViewType | undefined,
) =>
  isDefined(viewType) && VIEW_TYPES_WITH_RECORD_GROUP_TABS.includes(viewType);
