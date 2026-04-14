import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useWorkspaceNavigationObjectMetadataIds = (): {
  objectMetadataIdsWithObjectNavigationItem: Set<string>;
} => {
  const { workspaceNavigationMenuItems: rawWorkspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const objectMetadataIdsWithObjectNavigationItem = new Set(
    rawWorkspaceNavigationMenuItems
      .filter((item) => item.type === NavigationMenuItemType.OBJECT)
      .map((item) => item.targetObjectMetadataId)
      .filter(isDefined),
  );

  return {
    objectMetadataIdsWithObjectNavigationItem,
  };
};
