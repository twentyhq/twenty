import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemEditFolderData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditFolderData';
import { useNavigationMenuItemEditSubView } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditSubView';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { NAVIGATION_MENU_ITEM_TYPE } from '@/navigation-menu-item/types/navigation-menu-item-type';

type FolderOption = {
  id: string;
  name: string;
  folderId?: string;
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
  const { closeCommandMenu } = useCommandMenu();
  const { clearSubView } = useNavigationMenuItemEditSubView();
  const { moveToFolder } = useNavigationMenuItemMoveRemove();
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const { selectedItem, selectedItemType } =
    useSelectedNavigationMenuItemEditData();
  const { allFolders, workspaceFolders } =
    useNavigationMenuItemEditFolderData();

  const selectedFolderId =
    selectedItemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER
      ? selectedNavigationMenuItemInEditMode
      : null;
  const currentFolderId =
    selectedItemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER
      ? (selectedItem?.id ?? null)
      : (selectedItem?.folderId ?? null);

  const descendantFolderIds =
    selectedItemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER &&
    isDefined(selectedFolderId)
      ? getDescendantFolderIds(selectedFolderId, allFolders)
      : new Set<string>();

  const includeNoFolderOption =
    (selectedItemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER &&
      isDefined(selectedFolderId)) ||
    (selectedItemType === NAVIGATION_MENU_ITEM_TYPE.LINK &&
      isDefined(currentFolderId));

  const folders =
    includeNoFolderOption &&
    selectedItemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER &&
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
    if (isDefined(selectedNavigationMenuItemInEditMode)) {
      moveToFolder(selectedNavigationMenuItemInEditMode, folderId);
      clearSubView();
      closeCommandMenu();
    }
  };

  return {
    foldersToShow,
    includeNoFolderOption,
    handleSelectFolder,
  };
};
