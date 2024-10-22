import styled from '@emotion/styled';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { Avatar, AvatarType, IconFolder } from 'twenty-ui';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsedContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsedContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemState } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemState';
import { useLocation } from 'react-router-dom';

const StyledAvatar = styled(Avatar)`
  :hover {
    cursor: grab;
  }
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

  const selectedFavoriteIndex = folder.favorites.findIndex(
    (favorite) => favorite.link === currentPath,
  );

  const subItemArrayLength = folder.favorites.length;

  return (
    <NavigationDrawerItemsCollapsedContainer
      key={folder.folderId}
      isGroup={isGroup}
    >
      <NavigationDrawerItem
        key={folder.folderId}
        label={folder.folderName}
        Icon={IconFolder}
        onClick={() => onToggle(folder.folderId)}
        active={isOpen}
      />
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
