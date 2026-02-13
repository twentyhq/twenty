import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { computeInsertIndexAndPosition } from '@/navigation-menu-item/utils/computeInsertIndexAndPosition';

export const useAddObjectToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );

  const addObjectToDraft = (
    objectMetadataId: string,
    defaultViewId: string,
    currentDraft: NavigationMenuItem[],
    targetFolderId?: string | null,
    targetIndex?: number,
  ): string => {
    const folderId = targetFolderId ?? null;

    const itemsInFolder = currentDraft.filter(
      (item) =>
        (item.folderId ?? null) === folderId &&
        !isDefined(item.userWorkspaceId),
    );
    const index = targetIndex ?? itemsInFolder.length;

    const { flatIndex, position } = computeInsertIndexAndPosition(
      currentDraft,
      folderId,
      index,
    );

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      viewId: defaultViewId,
      targetObjectMetadataId: objectMetadataId,
      position,
      userWorkspaceId: undefined,
      targetRecordId: undefined,
      folderId: folderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDraft = [
      ...currentDraft.slice(0, flatIndex),
      newItem,
      ...currentDraft.slice(flatIndex),
    ];
    setNavigationMenuItemsDraft(newDraft);
    return newItemId;
  };

  return { addObjectToDraft };
};
