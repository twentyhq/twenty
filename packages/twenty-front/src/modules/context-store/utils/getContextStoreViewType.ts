import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { ViewType } from '~/generated-metadata/graphql';

type ViewTypeValue = `${ViewType}`;

const VIEW_TYPE_TO_CONTEXT_STORE_VIEW_TYPE: Record<
  ViewTypeValue,
  ContextStoreViewType
> = {
  [ViewType.TABLE]: ContextStoreViewType.Table,
  [ViewType.TABLE_WIDGET]: ContextStoreViewType.Table,
  [ViewType.LIST]: ContextStoreViewType.Table,
  [ViewType.FIELDS_WIDGET]: ContextStoreViewType.Table,
  [ViewType.KANBAN]: ContextStoreViewType.Kanban,
  [ViewType.KANBAN_WIDGET]: ContextStoreViewType.Kanban,
  [ViewType.CALENDAR]: ContextStoreViewType.Calendar,
  [ViewType.CALENDAR_WIDGET]: ContextStoreViewType.Calendar,
};

export const getContextStoreViewType = (
  viewType: ViewTypeValue,
): ContextStoreViewType => VIEW_TYPE_TO_CONTEXT_STORE_VIEW_TYPE[viewType];
