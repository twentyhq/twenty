import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Avatar,
  AvatarType,
  IconDotsVertical,
  IconFolder,
  IconHeartOff,
  IconPencil,
  IconTrash,
} from 'twenty-ui';

import { FavoriteFolderHotkeyScope } from '@/favorites/constants/FavoriteFolderRightIconDropdownHotkeyScope';
import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsedContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsedContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemState } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemState';

const StyledAvatar = styled(Avatar)`
  :hover {
    cursor: grab;
  }
`;

const StyledDropdownContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
`;

type CurrentWorkspaceMemberFavoritesProps = {
  folder: {
    folderId: string;
    folderName: string;
    favorites: Array<{
      id: string;
      labelIdentifier: string;
      avatarUrl: string;
      avatarType: AvatarType;
      link: string;
      recordId: string;
    }>;
  };
  isGroup: boolean;
  handleReorderFavorite: OnDragEndResponder;
  isOpen: boolean;
  onToggle: (folderId: string) => void;
};

export const CurrentWorkspaceMemberFavorites = ({
  folder,
  isGroup,
  handleReorderFavorite,
  isOpen,
  onToggle,
}: CurrentWorkspaceMemberFavoritesProps) => {
  const currentPath = useLocation().pathname;
  const theme = useTheme();
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderName, setFolderName] = useState(folder.folderName);
  const { renameFolder, deleteFolder } = useFavoriteFolders();
  const { closeDropdown, isDropdownOpen } = useDropdown(
    `favorite-folder-${folder.folderId}`,
  );
  const selectedFavoriteIndex = folder.favorites.findIndex(
    (favorite) => favorite.link === currentPath,
  );
  const { deleteFavorite } = useFavorites();

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
    await deleteFolder(folder.folderId);
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
        <StyledDropdownContainer>
          <MenuItem
            LeftIcon={IconPencil}
            onClick={() => {
              setIsRenaming(true);
              closeDropdown();
            }}
            accent={'default'}
            text={'Rename'}
          />
          <MenuItem
            LeftIcon={IconTrash}
            onClick={() => {
              handleDelete();
              closeDropdown();
            }}
            accent={'danger'}
            text={'Delete'}
          />
        </StyledDropdownContainer>
      }
    />
  );

  return (
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
          active={isOpen}
          rightOptions={rightOptions}
          className="navigation-drawer-item"
          isDropdownOpen={isDropdownOpen}
        />
      )}

      {isOpen && (
        <NavigationDrawerItemsCollapsedContainer isGroup={isGroup}>
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
                        Icon={() => (
                          <StyledAvatar
                            placeholderColorSeed={favorite.recordId}
                            avatarUrl={favorite.avatarUrl}
                            type={favorite.avatarType}
                            placeholder={favorite.labelIdentifier}
                            className="fav-avatar"
                          />
                        )}
                        to={favorite.link}
                        active={favorite.link === currentPath}
                        subItemState={getNavigationSubItemState({
                          index,
                          arrayLength: subItemArrayLength,
                          selectedIndex: selectedFavoriteIndex,
                        })}
                        rightOptions={
                          <IconHeartOff
                            size={theme.icon.size.sm}
                            color={theme.color.red}
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
        </NavigationDrawerItemsCollapsedContainer>
      )}
    </NavigationDrawerItemsCollapsedContainer>
  );
};
