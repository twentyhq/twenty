import { FavoriteFolderNavigationDrawerItemDropdown } from '@/favorites/components/FavoriteFolderNavigationDrawerItemDropdown';
import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useDeleteFavoriteFolder } from '@/favorites/hooks/useDeleteFavoriteFolder';
import { useRenameFavoriteFolder } from '@/favorites/hooks/useRenameFavoriteFolder';
import { useReorderFavorite } from '@/favorites/hooks/useReorderFavorite';
import { activeFavoriteFolderIdState } from '@/favorites/states/activeFavoriteFolderIdState';
import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';
import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { DragStart, DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  IconFolder,
  IconFolderOpen,
  IconHeartOff,
  LightIconButton,
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
  const [isDragging, setIsDragging] = useState(false);

  const [isFavoriteFolderRenaming, setIsFavoriteFolderRenaming] =
    useState(false);
  const [favoriteFolderName, setFavoriteFolderName] = useState(
    folder.folderName,
  );
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
  const { handleReorderFavorite } = useReorderFavorite();

  const { deleteFavorite } = useDeleteFavorite();

  const favoriteFolderContentLength = folder.favorites.length;

  const handleSubmitRename = async (value: string) => {
    if (value === '') return;
    await renameFavoriteFolder(folder.folderId, value);
    setIsFavoriteFolderRenaming(false);
    return true;
  };

  const handleCancelRename = () => {
    setFavoriteFolderName(folder.folderName);
    setIsFavoriteFolderRenaming(false);
  };

  const handleClickOutside = async (
    event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsFavoriteFolderRenaming(false);
      return;
    }

    await renameFavoriteFolder(folder.folderId, value);
    setIsFavoriteFolderRenaming(false);
  };

  const handleFavoriteFolderDelete = async () => {
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

  const handleDragStart = (_: DragStart) => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    handleReorderFavorite(result, provided);
  };

  const rightOptions = (
    <FavoriteFolderNavigationDrawerItemDropdown
      folderId={folder.folderId}
      onRename={() => setIsFavoriteFolderRenaming(true)}
      onDelete={handleFavoriteFolderDelete}
      closeDropdown={closeFavoriteFolderEditDropdown}
    />
  );

  return (
    <>
      <NavigationDrawerItemsCollapsableContainer
        key={folder.folderId}
        isGroup={isGroup}
      >
        {isFavoriteFolderRenaming ? (
          <NavigationDrawerInput
            Icon={IconFolder}
            value={favoriteFolderName}
            onChange={setFavoriteFolderName}
            onSubmit={handleSubmitRename}
            onCancel={handleCancelRename}
            onClickOutside={handleClickOutside}
            hotkeyScope="favorites-folder-input"
          />
        ) : (
          <NavigationDrawerItem
            key={folder.folderId}
            label={folder.folderName}
            Icon={isOpen ? IconFolderOpen : IconFolder}
            onClick={handleToggle}
            rightOptions={rightOptions}
            className="navigation-drawer-item"
            active={isFavoriteFolderEditDropdownOpen}
          />
        )}

        {isOpen && (
          <DraggableList
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            draggableItems={
              <>
                {folder.favorites.map((favorite, index) => (
                  <DraggableItem
                    key={favorite.id}
                    draggableId={favorite.id}
                    index={index}
                    isInsideScrollableContainer
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
                        isDragging={isDragging}
                      />
                    }
                  />
                ))}
              </>
            }
          />
        )}
      </NavigationDrawerItemsCollapsableContainer>

      {createPortal(
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          title={`Remove ${folder.favorites.length} ${folder.favorites.length > 1 ? 'favorites' : 'favorite'}?`}
          subtitle={`This action will delete this favorite folder ${folder.favorites.length > 1 ? `and all ${folder.favorites.length} favorites` : 'and the favorite'} inside. Do you want to continue?`}
          onConfirmClick={handleConfirmDelete}
          deleteButtonText="Delete Folder"
        />,
        document.body,
      )}
    </>
  );
};
