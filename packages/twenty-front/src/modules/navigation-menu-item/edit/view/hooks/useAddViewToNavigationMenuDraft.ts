import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { computeInsertIndexAndPosition } from '@/navigation-menu-item/common/utils/computeInsertIndexAndPosition';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

export const useAddViewToNavigationMenuDraft = () => {
  const { currentItems, targetUserWorkspaceId, applyCreate } =
    useNavigationMenuItemEditController();

  const addViewToDraft = (
    viewId: string,
    targetFolderId?: string | null,
    targetIndex?: number,
    color?: string | null,
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
      type: NavigationMenuItemType.VIEW,
      viewId,
      targetObjectMetadataId: undefined,
      position,
      userWorkspaceId: targetUserWorkspaceId,
      targetRecordId: undefined,
      folderId: folderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    void applyCreate(newItem, flatIndex);
    return newItemId;
  };

  return { addViewToDraft };
};
