import { ViewType } from '@/views/types/ViewType';
import { ViewType as CoreViewType } from '~/generated/graphql';

export const convertCoreViewTypeToViewType = (
  coreViewType: CoreViewType,
): ViewType => {
  const coreViewTypeToViewTypeMapping = {
    [CoreViewType.KANBAN]: ViewType.Kanban,
    [CoreViewType.TABLE]: ViewType.Table,
    [CoreViewType.CALENDAR]: ViewType.Calendar,
  };

  return (
    coreViewTypeToViewTypeMapping[
      coreViewType as keyof typeof coreViewTypeToViewTypeMapping
    ] ?? ViewType.Table
  );
};
