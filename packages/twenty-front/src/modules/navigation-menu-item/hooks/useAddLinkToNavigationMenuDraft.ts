import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorLink';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { computeInsertIndexAndPosition } from '@/navigation-menu-item/utils/computeInsertIndexAndPosition';
import { normalizeUrl } from '@/navigation-menu-item/utils/normalizeUrl';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useAddLinkToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );

  const addLinkToDraft = (
    label: string,
    url: string,
    currentDraft: NavigationMenuItem[],
    targetFolderId?: string | null,
    targetIndex?: number,
  ): string => {
    const normalizedUrl = normalizeUrl(url);
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
      viewId: undefined,
      targetObjectMetadataId: undefined,
      targetRecordId: undefined,
      folderId: folderId ?? undefined,
      position,
      userWorkspaceId: undefined,
      name: label.trim() || 'Link',
      link: normalizedUrl,
      color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK,
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

  return { addLinkToDraft };
};
