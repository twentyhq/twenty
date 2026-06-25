import { useState } from 'react';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID } from '@/navigation-menu-item/common/constants/NavigationMenuItemFolderDeleteModalId';
import { useDeleteNavigationMenuItemFolder } from '@/navigation-menu-item/edit/folder/hooks/useDeleteNavigationMenuItemFolder';
import { useRenameNavigationMenuItemFolder } from '@/navigation-menu-item/edit/folder/hooks/useRenameNavigationMenuItemFolder';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type UseFavoritesFolderEditParams = {
  folderId: string;
  folderName: string;
  navigationMenuItems: NavigationMenuItem[];
};

export const useFavoritesFolderEdit = ({
  folderId,
  folderName: initialFolderName,
  navigationMenuItems,
}: UseFavoritesFolderEditParams) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderNameValue, setFolderNameValue] = useState(initialFolderName);

  const { renameNavigationMenuItemFolder } =
    useRenameNavigationMenuItemFolder();
  const { deleteNavigationMenuItemFolder } =
    useDeleteNavigationMenuItemFolder();
  const { openModal } = useModal();

  const dropdownId = `navigation-menu-item-folder-edit-${folderId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { closeDropdown } = useCloseDropdown();

  const modalId = `${NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID}-${folderId}`;
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );

  const handleSubmitRename = async (value: string) => {
    if (value === '') return;
    await renameNavigationMenuItemFolder(folderId, value);
    setIsRenaming(false);
    return true;
  };

  const handleCancelRename = () => {
    setFolderNameValue(initialFolderName);
    setIsRenaming(false);
  };

  const handleClickOutsideRename = async (
    _event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsRenaming(false);
      return;
    }
    await renameNavigationMenuItemFolder(folderId, value);
    setIsRenaming(false);
  };

  const handleFolderDelete = async () => {
    if (navigationMenuItems.length > 0) {
      openModal(modalId);
      closeDropdown(dropdownId);
    } else {
      await deleteNavigationMenuItemFolder(folderId);
      closeDropdown(dropdownId);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteNavigationMenuItemFolder(folderId);
  };

  return {
    isRenaming,
    setIsRenaming,
    folderNameValue,
    setFolderNameValue,
    handleSubmitRename,
    handleCancelRename,
    handleClickOutsideRename,
    handleFolderDelete,
    handleConfirmDelete,
    isDropdownOpen,
    dropdownId,
    closeDropdown: () => closeDropdown(dropdownId),
    modalId,
    isModalOpened,
    navigationMenuItemCount: navigationMenuItems.length,
  };
};
