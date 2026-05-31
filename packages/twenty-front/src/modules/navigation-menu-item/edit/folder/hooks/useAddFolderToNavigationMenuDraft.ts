import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { computeInsertIndexAndPosition } from '@/navigation-menu-item/common/utils/computeInsertIndexAndPosition';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

export const useAddFolderToNavigationMenuDraft = () => {
  const { currentItems, targetUserWorkspaceId, applyCreate } =
    useNavigationMenuItemEditController();

  const addFolderToDraft = (
    name: string,
    targetFolderId?: string | null,
    targetIndex?: number,
  ): string => {
    const folderId = targetFolderId ?? null;

    const itemsInFolder = currentItems.filter(
      (item) => (item.folderId ?? null) === folderId,
    );
    const index = targetIndex ?? itemsInFolder.length;

    const { flatIndex, position } = computeInsertIndexAndPosition(
      currentItems,
      folderId,
      index,
    );

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      type: NavigationMenuItemType.FOLDER,
      viewId: undefined,
      targetObjectMetadataId: undefined,
      targetRecordId: undefined,
      folderId: folderId ?? undefined,
      position,
      userWorkspaceId: targetUserWorkspaceId,
      name: name.trim(),
      color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    void applyCreate(newItem, flatIndex);
    return newItemId;
  };

  return { addFolderToDraft };
};
