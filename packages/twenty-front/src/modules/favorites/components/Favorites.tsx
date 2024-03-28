import styled from '@emotion/styled';
import {
  Avatar,
  DraggableItem,
  DraggableList,
  NavigationDrawerItem,
  NavigationDrawerSection,
  NavigationDrawerSectionTitle,
} from 'twenty-ui';

import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

import { useFavorites } from '../hooks/useFavorites';

const StyledContainer = styled(NavigationDrawerSection)`
  width: 100%;
`;

const StyledAvatar = styled(Avatar)`
  :hover {
    cursor: grab;
  }
`;

const StyledNavigationDrawerItem = styled(NavigationDrawerItem)`
  :active {
    cursor: grabbing;

    .fav-avatar:hover {
      cursor: grabbing;
    }
  }
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
                    <StyledNavigationDrawerItem
                      key={id}
                      label={labelIdentifier}
                      Icon={() => (
                        <StyledAvatar
                          entityId={recordId}
                          avatarUrl={getImageAbsoluteURIOrBase64(avatarUrl)}
                          type={avatarType}
                          placeholder={labelIdentifier}
                          className="fav-avatar"
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
