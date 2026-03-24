import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { computeInsertIndexAndPosition } from '@/navigation-menu-item/common/utils/computeInsertIndexAndPosition';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type AddObjectToNavigationMenuDraftParams = {
  objectMetadataId: string;
  currentDraft: NavigationMenuItem[];
  targetFolderId?: string | null;
  targetIndex?: number;
  color?: string | null;
};

export const useAddObjectToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );

  const addObjectToDraft = ({
    objectMetadataId,
    currentDraft,
    targetFolderId,
    targetIndex,
    color,
  }: AddObjectToNavigationMenuDraftParams): string => {
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
      type: NavigationMenuItemType.OBJECT,
      viewId: undefined,
      targetObjectMetadataId: objectMetadataId,
      position,
      userWorkspaceId: undefined,
      targetRecordId: undefined,
      folderId: folderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      color,
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
