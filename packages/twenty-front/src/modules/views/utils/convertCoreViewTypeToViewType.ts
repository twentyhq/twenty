import { ViewType } from '@/views/types/ViewType';
import { ViewType as CoreViewType } from '~/generated/graphql';

export const convertCoreViewTypeToViewType = (
  coreViewType: CoreViewType,
): ViewType => {
  return coreViewType === CoreViewType.KANBAN
    ? ViewType.Kanban
    : ViewType.Table;
};
