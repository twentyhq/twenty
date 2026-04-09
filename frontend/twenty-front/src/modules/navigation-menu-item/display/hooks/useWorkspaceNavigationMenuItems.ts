import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useWorkspaceNavigationMenuItems = (): {
  objectMetadataIdsInWorkspaceNav: Set<string>;
} => {
  const { workspaceNavigationMenuItems: rawWorkspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const objectMetadataIdsInWorkspaceNav = new Set(
    rawWorkspaceNavigationMenuItems
      .filter((item) => item.type === NavigationMenuItemType.OBJECT)
      .map((item) => item.targetObjectMetadataId)
      .filter((objectMetadataId) => isDefined(objectMetadataId)),
  );

  return {
    objectMetadataIdsInWorkspaceNav,
  };
};
