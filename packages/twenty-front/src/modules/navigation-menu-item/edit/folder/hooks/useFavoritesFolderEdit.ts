import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID } from '@/navigation-menu-item/common/constants/NavigationMenuItemFolderDeleteModalId';
import { useDeleteNavigationMenuItemFolder } from '@/navigation-menu-item/edit/folder/hooks/useDeleteNavigationMenuItemFolder';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type UseFavoritesFolderEditParams = {
  folderId: string;
  navigationMenuItems: NavigationMenuItem[];
};

export const useFavoritesFolderEdit = ({
  folderId,
  navigationMenuItems,
}: UseFavoritesFolderEditParams) => {
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );

  const startEditing = () => {
    setSelectedNavigationMenuItemIdInEditMode(folderId);
    setNavigationMenuItemIdToRename(folderId);
  };

  const { deleteNavigationMenuItemFolder } =
    useDeleteNavigationMenuItemFolder();
  const { openDialog } = useDialog();

  const dropdownId = `navigation-menu-item-folder-edit-${folderId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const modalId = `${NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID}-${folderId}`;
  const isDialogOpened = useAtomComponentStateValue(
    isDialogOpenedComponentState,
    modalId,
  );

  const handleFolderDelete = async () => {
    if (navigationMenuItems.length > 0) {
      openDialog(modalId);
    } else {
      await deleteNavigationMenuItemFolder(folderId);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteNavigationMenuItemFolder(folderId);
  };

  return {
    startEditing,
    handleFolderDelete,
    handleConfirmDelete,
    isDropdownOpen,
    modalId,
    isDialogOpened,
    navigationMenuItemCount: navigationMenuItems.length,
  };
};
