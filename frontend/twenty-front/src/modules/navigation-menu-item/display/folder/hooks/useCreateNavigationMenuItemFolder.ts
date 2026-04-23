import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useCreateNavigationMenuItemFolder = () => {
  const { navigationMenuItems, currentWorkspaceMemberId } =
    useNavigationMenuItemsData();

  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();

  const createNewNavigationMenuItemFolder = async (
    name: string,
  ): Promise<void> => {
    if (!name || !currentWorkspaceMemberId) {
      return;
    }

    const topLevelItems = navigationMenuItems.filter(
      (item) =>
        !isDefined(item.folderId) &&
        item.userWorkspaceId === currentWorkspaceMemberId,
    );

    const minPosition =
      topLevelItems.length > 0
        ? Math.min(...topLevelItems.map((item) => item.position))
        : 1;

    await createManyNavigationMenuItems([
      {
        type: NavigationMenuItemType.FOLDER,
        name,
        targetRecordId: null,
        targetObjectMetadataId: null,
        userWorkspaceId: currentWorkspaceMemberId,
        folderId: null,
        position: minPosition - 1,
      },
    ]);
  };

  return { createNewNavigationMenuItemFolder };
};
