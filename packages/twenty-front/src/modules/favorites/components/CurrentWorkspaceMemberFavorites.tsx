import { FavoriteFolderNavigationDrawerItemDropdown } from '@/favorites/components/FavoriteFolderNavigationDrawerItemDropdown';
import { FavoriteIcon } from '@/favorites/components/FavoriteIcon';
import { FavoritesDroppable } from '@/favorites/components/FavoritesDroppable';
import { FavoritesDragContext } from '@/favorites/contexts/FavoritesDragContext';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useDeleteFavoriteFolder } from '@/favorites/hooks/useDeleteFavoriteFolder';
import { useRenameFavoriteFolder } from '@/favorites/hooks/useRenameFavoriteFolder';
import { openFavoriteFolderIdsState } from '@/favorites/states/openFavoriteFolderIdsState';
import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';
import { ProcessedFavorite } from '@/favorites/utils/sortFavorites';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { Droppable } from '@hello-pangea/dnd';
import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  AnimatedExpandableContainer,
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
  const { isDragging } = useContext(FavoritesDragContext);
  const [isFavoriteFolderRenaming, setIsFavoriteFolderRenaming] =
    useState(false);
  const [favoriteFolderName, setFavoriteFolderName] = useState(
    folder.folderName,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [openFavoriteFolderIds, setOpenFavoriteFolderIds] = useRecoilState(
    openFavoriteFolderIdsState,
  );
  const isOpen = openFavoriteFolderIds.includes(folder.folderId);

  const handleToggle = () => {
    setOpenFavoriteFolderIds((currentOpenFolders) => {
      if (isOpen) {
        return currentOpenFolders.filter((id) => id !== folder.folderId);
      } else {
        return [...currentOpenFolders, folder.folderId];
      }
    });
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
          <FavoritesDroppable droppableId={`folder-header-${folder.folderId}`}>
            <NavigationDrawerItem
              label={folder.folderName}
              Icon={isOpen ? IconFolderOpen : IconFolder}
              onClick={handleToggle}
              rightOptions={rightOptions}
              className="navigation-drawer-item"
              isRightOptionsDropdownOpen={isFavoriteFolderEditDropdownOpen}
            />
          </FavoritesDroppable>
        )}

        <AnimatedExpandableContainer
          isExpanded={isOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          <Droppable droppableId={`folder-${folder.folderId}`}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...provided.droppableProps}
                // TODO: (Drag Drop Bug) Adding bottom margin to ensure drag-to-last-position works. Need to find better solution that doesn't affect spacing.
                // Issue: Without margin, dragging to last position triggers next folder drop area
              >
                {folder.favorites.map((favorite, index) => (
                  <DraggableItem
                    key={favorite.id}
                    draggableId={favorite.id}
                    index={index}
                    isInsideScrollableContainer
                    itemComponent={
                      <NavigationDrawerSubItem
                        label={favorite.labelIdentifier}
                        objectName={favorite.objectNameSingular}
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </AnimatedExpandableContainer>
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
