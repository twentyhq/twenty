import styled from '@emotion/styled';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { Avatar } from '@/users/components/Avatar';

import { useFavorites } from '../hooks/useFavorites';

const StyledContainer = styled(NavigationDrawerSection)`
  overflow-x: auto;
  width: 100%;
`;

export const Favorites = () => {
  const { favorites, handleReorderFavorite } = useFavorites();

  if (!favorites || favorites.length === 0) return <></>;

  return (
    <StyledContainer>
      <NavigationDrawerSectionTitle label="Favorites" />
      <DraggableList
        onDragEnd={handleReorderFavorite}
        draggableItems={
          <>
            {favorites.map((favorite, index) => {
              const {
                id,
                labelIdentifier,
                avatarUrl,
                avatarType,
                link,
                recordId,
              } = favorite;

              return (
                <DraggableItem
                  key={id}
                  draggableId={id}
                  index={index}
                  itemComponent={
                    <NavigationDrawerItem
                      key={id}
                      label={labelIdentifier}
                      Icon={() => (
                        <Avatar
                          colorId={recordId}
                          avatarUrl={avatarUrl}
                          type={avatarType}
                          placeholder={labelIdentifier}
                        />
                      )}
                      to={link}
                    />
                  }
                />
              );
            })}
          </>
        }
      />
    </StyledContainer>
  );
};
