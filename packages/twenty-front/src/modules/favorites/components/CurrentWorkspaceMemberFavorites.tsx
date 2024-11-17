import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoriteFolderHotkeyScope } from '@/favorites/constants/FavoriteFolderRightIconDropdownHotkeyScope';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useDeleteFavoriteFolder } from '@/favorites/hooks/useDeleteFavoriteFolder';
import { useRenameFavoriteFolder } from '@/favorites/hooks/useRenameFavoriteFolder';
import { useReorderFavorite } from '@/favorites/hooks/useReorderFavorite';
import { activeFavoriteFolderIdState } from '@/favorites/states/activeFavoriteFolderIdState';
import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';
import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsedContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsedContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  IconDotsVertical,
  IconFolder,
  IconHeartOff,
  IconPencil,
  IconTrash,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

type CurrentWorkspaceMemberFavoritesProps = {
  folder: {
    folderId: string;
    folderName: string;
    favorites: ProcessedFavorite[];
  };
  isGroup: boolean;
};

export const CurrentWorkspaceMemberFavorites = ({
  folder,
  isGroup,
}: CurrentWorkspaceMemberFavoritesProps) => {
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;

  const theme = useTheme();
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderName, setFolderName] = useState(folder.folderName);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeFavoriteFolderId, setActiveFavoriteFolderId] = useRecoilState(
    activeFavoriteFolderIdState,
  );
  const isOpen = activeFavoriteFolderId === folder.folderId;

  const handleToggle = () => {
    setActiveFavoriteFolderId(isOpen ? null : folder.folderId);
  };

  const { renameFavoriteFolder } = useRenameFavoriteFolder();
  const { deleteFavoriteFolder } = useDeleteFavoriteFolder();
  const {
    closeDropdown: closeFavoriteFolderEditDropdown,
    isDropdownOpen: isFavoriteFolderEditDropdownOpen,
  } = useDropdown(`favorite-folder-edit-${folder.folderId}`);
  const selectedFavoriteIndex = folder.favorites.findIndex((favorite) =>
    isLocationMatchingFavorite(currentPath, currentViewPath, favorite),
  );
  const handleReorderFavorite = useReorderFavorite();

  const deleteFavorite = useDeleteFavorite();

  const favoriteFolderContentLength = folder.favorites.length;

  const handleSubmitRename = async (value: string) => {
    if (value === '') return;
    await renameFavoriteFolder(folder.folderId, value);
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

    await renameFavoriteFolder(folder.folderId, value);
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (folder.favorites.length > 0) {
      setIsDeleteModalOpen(true);
      closeFavoriteFolderEditDropdown();
    } else {
      await deleteFavoriteFolder(folder.folderId);
      closeFavoriteFolderEditDropdown();
    }
  };

  const handleConfirmDelete = async () => {
    await deleteFavoriteFolder(folder.folderId);
    setIsDeleteModalOpen(false);
  };

  const rightOptions = (
    <Dropdown
      dropdownId={`favorite-folder-edit-${folder.folderId}`}
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
              closeFavoriteFolderEditDropdown();
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
            onClick={handleToggle}
            rightOptions={rightOptions}
            className="navigation-drawer-item"
            isDropdownOpen={isFavoriteFolderEditDropdownOpen}
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
                        label={favorite.labelIdentifier}
                        Icon={() => <FavoriteIcon favorite={favorite} />}
                        to={favorite.link}
                        active={index === selectedFavoriteIndex}
                        subItemState={getNavigationSubItemLeftAdornment({
                          index,
                          arrayLength: favoriteFolderContentLength,
                          selectedIndex: selectedFavoriteIndex,
                        })}
                        rightOptions={
                          <LightIconButton
                            Icon={IconHeartOff}
                            onClick={() => deleteFavorite(favorite.id)}
                            accent="tertiary"
                          />
                        }
                        isDraggable
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
