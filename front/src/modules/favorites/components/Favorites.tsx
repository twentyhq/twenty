import styled from '@emotion/styled';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import NavItem from '@/ui/navigation/navigation-drawer/components/NavItem';
import NavTitle from '@/ui/navigation/navigation-drawer/components/NavTitle';
import { Avatar } from '@/users/components/Avatar';

import { useFavorites } from '../hooks/useFavorites';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  width: 100%;
`;

export const Favorites = () => {
  const { favorites, handleReorderFavorite } = useFavorites({
    objectNamePlural: 'companies',
  });

  if (!favorites || favorites.length === 0) return <></>;

  return (
    <StyledContainer>
      <NavTitle label="Favorites" />
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
                    <NavItem
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
