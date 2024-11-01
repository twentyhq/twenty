import { useTheme } from '@emotion/react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IconDotsVertical,
  IconFolder,
  IconHeartOff,
  IconPencil,
  IconTrash,
} from 'twenty-ui';

import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoriteFolderHotkeyScope } from '@/favorites/constants/FavoriteFolderRightIconDropdownHotkeyScope';
import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsedContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsedContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemState } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemState';

type CurrentWorkspaceMemberFavoritesProps = {
  folder: {
    folderId: string;
    folderName: string;
    favorites: ProcessedFavorite[];
  };
  isGroup: boolean;
  isOpen: boolean;
  onToggle: (folderId: string) => void;
};

export const CurrentWorkspaceMemberFavorites = ({
  folder,
  isGroup,
  isOpen,
  onToggle,
}: CurrentWorkspaceMemberFavoritesProps) => {
  const currentPath = useLocation().pathname;
  const currentPathView = useLocation().pathname + useLocation().search;

  const theme = useTheme();
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderName, setFolderName] = useState(folder.folderName);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { renameFolder, deleteFolder } = useFavoriteFolders();
  const { closeDropdown, isDropdownOpen } = useDropdown(
    `favorite-folder-${folder.folderId}`,
  );
  const selectedFavoriteIndex = folder.favorites.findIndex((favorite) =>
    favorite.objectNameSingular === 'view'
      ? favorite.link === currentPathView
      : favorite.link === currentPath,
  );
  const { deleteFavorite, handleReorderFavorite } = useFavorites();

  const subItemArrayLength = folder.favorites.length;

  const handleSubmitRename = async (value: string) => {
    if (!value) return false;

    await renameFolder(folder.folderId, value);
    setIsRenaming(false);
    return true;
  };

  const handleCancelRename = () => {
    setFolderName(folder.folderName);
    setIsRenaming(false);
  };

  const handleClickOutside = async (
    event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsRenaming(false);
      return;
    }

    await renameFolder(folder.folderId, value);
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (folder.favorites.length > 0) {
      setIsDeleteModalOpen(true);
      closeDropdown();
    } else {
      await deleteFolder(folder.folderId);
      closeDropdown();
    }
  };

  const handleConfirmDelete = async () => {
    await deleteFolder(folder.folderId);
    setIsDeleteModalOpen(false);
  };

  const rightOptions = (
    <Dropdown
      dropdownId={`favorite-folder-${folder.folderId}`}
      dropdownHotkeyScope={{
        scope: FavoriteFolderHotkeyScope.FavoriteFolderRightIconDropdown,
      }}
      data-select-disable
      clickableComponent={
        <IconDotsVertical
          size={theme.icon.size.md}
          color={theme.color.gray50}
        />
      }
      dropdownPlacement="right"
      dropdownOffset={{ y: -15 }}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            LeftIcon={IconPencil}
            onClick={() => {
              setIsRenaming(true);
              closeDropdown();
            }}
            accent="default"
            text="Rename"
          />
          <MenuItem
            LeftIcon={IconTrash}
            onClick={handleDelete}
            accent="danger"
            text="Delete"
          />
        </DropdownMenuItemsContainer>
      }
    />
  );

  return (
    <>
      <NavigationDrawerItemsCollapsedContainer
        key={folder.folderId}
        isGroup={isGroup}
      >
        {isRenaming ? (
          <NavigationDrawerInput
            Icon={IconFolder}
            value={folderName}
            onChange={setFolderName}
            onSubmit={handleSubmitRename}
            onCancel={handleCancelRename}
            onClickOutside={handleClickOutside}
            hotkeyScope="favorites-folder-input"
          />
        ) : (
          <NavigationDrawerItem
            key={folder.folderId}
            label={folder.folderName}
            Icon={IconFolder}
            onClick={() => onToggle(folder.folderId)}
            rightOptions={rightOptions}
            className="navigation-drawer-item"
            isDropdownOpen={isDropdownOpen}
          />
        )}

        {isOpen && (
          <DraggableList
            onDragEnd={handleReorderFavorite}
            draggableItems={
              <>
                {folder.favorites.map((favorite, index) => (
                  <DraggableItem
                    key={favorite.id}
                    draggableId={favorite.id}
                    index={index}
                    itemComponent={
                      <NavigationDrawerSubItem
                        key={favorite.id}
                        className="navigation-drawer-sub-item"
                        label={favorite.labelIdentifier}
                        Icon={() => <FavoriteIcon favorite={favorite} />}
                        to={favorite.link}
                        active={
                          favorite.objectNameSingular === 'view'
                            ? favorite.link === currentPathView
                            : favorite.link === currentPath
                        }
                        subItemState={getNavigationSubItemState({
                          index,
                          arrayLength: subItemArrayLength,
                          selectedIndex: selectedFavoriteIndex,
                        })}
                        rightOptions={
                          <IconHeartOff
                            size={theme.icon.size.sm}
                            color={theme.color.gray50}
                            onClick={() => deleteFavorite(favorite.id)}
                          />
                        }
                      />
                    }
                  />
                ))}
              </>
            }
          />
        )}
      </NavigationDrawerItemsCollapsedContainer>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        confirmationValue="yes"
        confirmationPlaceholder="yes"
        title={`Remove ${folder.favorites.length} favorites?`}
        subtitle={`This action will delete this favorite folder and all ${folder.favorites.length} favorites inside. Do you want to continue?`}
        onConfirmClick={handleConfirmDelete}
        deleteButtonText="Delete Folder"
      />
    </>
  );
};
