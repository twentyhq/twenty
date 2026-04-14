import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useWorkspaceNavigationObjectMetadataIds = (): {
  objectMetadataIdsWithAnyNavigationItem: Set<string>;
  objectMetadataIdsWithObjectNavigationItem: Set<string>;
} => {
  const { workspaceNavigationMenuItems: rawWorkspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);

  const objectMetadataIdsWithAnyNavigationItem = new Set(
    rawWorkspaceNavigationMenuItems
      .map((item) => {
        if (
          item.type === NavigationMenuItemType.OBJECT ||
          item.type === NavigationMenuItemType.RECORD
        ) {
          return item.targetObjectMetadataId;
        }
        if (item.type === NavigationMenuItemType.VIEW) {
          const view = views.find((view) => view.id === item.viewId);
          return view?.objectMetadataId;
        }
        return undefined;
      })
      .filter(isDefined),
  );

  const objectMetadataIdsWithObjectNavigationItem = new Set(
    rawWorkspaceNavigationMenuItems
      .filter((item) => item.type === NavigationMenuItemType.OBJECT)
      .map((item) => item.targetObjectMetadataId)
      .filter(isDefined),
  );

  return {
    objectMetadataIdsWithAnyNavigationItem,
    objectMetadataIdsWithObjectNavigationItem,
  };
};
