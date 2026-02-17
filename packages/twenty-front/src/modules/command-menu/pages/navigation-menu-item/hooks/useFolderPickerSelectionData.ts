import { isDefined } from 'twenty-shared/utils';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useDraftNavigationMenuItemsAllFolders } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItemsAllFolders';
import { useDraftNavigationMenuItemsWorkspaceFolders } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItemsWorkspaceFolders';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';

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

type UseFolderPickerSelectionDataParams = {
  onCloseSubView: () => void;
};

export const useFolderPickerSelectionData = ({
  onCloseSubView,
}: UseFolderPickerSelectionDataParams) => {
  const { closeCommandMenu } = useCommandMenu();
  const { moveToFolder } = useNavigationMenuItemMoveRemove();
  const selectedNavigationMenuItemInEditMode = useRecoilValueV2(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const selectedItemType = selectedItem?.itemType ?? null;
  const { allFolders } = useDraftNavigationMenuItemsAllFolders();
  const { workspaceFolders } = useDraftNavigationMenuItemsWorkspaceFolders();

  const selectedFolderId =
    selectedItemType === NavigationMenuItemType.FOLDER
      ? selectedNavigationMenuItemInEditMode
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
    if (isDefined(selectedNavigationMenuItemInEditMode)) {
      moveToFolder(selectedNavigationMenuItemInEditMode, folderId);
      onCloseSubView();
      closeCommandMenu();
    }
  };

  return {
    foldersToShow,
    includeNoFolderOption,
    handleSelectFolder,
  };
};
