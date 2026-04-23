import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemType } from 'twenty-shared/types';
import { useDraftNavigationMenuItemsAllFolders } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItemsAllFolders';
import { useDraftNavigationMenuItemsWorkspaceFolders } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItemsWorkspaceFolders';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type FolderOption = {
  id: string;
  name: string;
  folderId?: string | null;
};

const getDescendantFolderIds = (
  folderId: string,
  allFolders: FolderOption[],
): Set<string> => {
  const result = new Set<string>();
  for (const folder of allFolders) {
    if (folder.folderId !== folderId) continue;
    result.add(folder.id);
    getDescendantFolderIds(folder.id, allFolders).forEach((id) =>
      result.add(id),
    );
  }
  return result;
};

const excludeCurrentFolder = <T extends { id: string }>(
  folders: T[],
  currentFolderId: string | null,
): T[] =>
  !isDefined(currentFolderId)
    ? folders
    : folders.filter((folder) => folder.id !== currentFolderId);

export const useFolderPickerSelectionData = () => {
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { moveToFolder } = useNavigationMenuItemMoveRemove();
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const selectedItemType = selectedItem?.type ?? null;
  const { allFolders } = useDraftNavigationMenuItemsAllFolders();
  const { workspaceFolders } = useDraftNavigationMenuItemsWorkspaceFolders();

  const selectedFolderId =
    selectedItemType === NavigationMenuItemType.FOLDER
      ? selectedNavigationMenuItemIdInEditMode
      : null;
  const currentFolderId =
    selectedItemType === NavigationMenuItemType.FOLDER
      ? (selectedItem?.id ?? null)
      : (selectedItem?.folderId ?? null);

  const descendantFolderIds =
    selectedItemType === NavigationMenuItemType.FOLDER &&
    isDefined(selectedFolderId)
      ? getDescendantFolderIds(selectedFolderId, allFolders)
      : new Set<string>();

  const includeNoFolderOption =
    (selectedItemType === NavigationMenuItemType.FOLDER &&
      isDefined(selectedFolderId)) ||
    (selectedItemType === NavigationMenuItemType.LINK &&
      isDefined(currentFolderId));

  const folders =
    includeNoFolderOption &&
    selectedItemType === NavigationMenuItemType.FOLDER &&
    isDefined(selectedFolderId)
      ? allFolders.filter(
          (folder) =>
            folder.id !== selectedFolderId &&
            !descendantFolderIds.has(folder.id),
        )
      : excludeCurrentFolder(allFolders, currentFolderId);

  const foldersToShow = includeNoFolderOption
    ? folders
    : excludeCurrentFolder(workspaceFolders, currentFolderId);

  const handleSelectFolder = (folderId: string | null) => {
    if (isDefined(selectedNavigationMenuItemIdInEditMode)) {
      moveToFolder(selectedNavigationMenuItemIdInEditMode, folderId);
      closeSidePanelMenu();
    }
  };

  return {
    foldersToShow,
    includeNoFolderOption,
    handleSelectFolder,
  };
};
