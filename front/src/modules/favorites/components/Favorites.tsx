import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import NavTitle from '@/ui/navigation/navbar/components/NavTitle';
import { Avatar } from '@/users/components/Avatar';
import { useGetFavoritesQuery } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { useFavorites } from '../hooks/useFavorites';
import { favoritesState } from '../states/favoritesState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  width: 100%;
`;

export const Favorites = () => {
  const [favorites, setFavorites] = useRecoilState(favoritesState);
  const { handleReorderFavorite } = useFavorites();

  useGetFavoritesQuery({
    onCompleted: (data) =>
      setFavorites(
        data?.findFavorites.map((favorite) => {
          return {
            id: favorite.id,
            person: favorite.person
              ? {
                  id: favorite.person.id,
                  firstName: favorite.person.firstName,
                  lastName: favorite.person.lastName,
                  avatarUrl: favorite.person.avatarUrl,
                }
              : undefined,
            company: favorite.company
              ? {
                  id: favorite.company.id,
                  name: favorite.company.name,
                  domainName: favorite.company.domainName,
                }
              : undefined,
            position: favorite.position,
          };
        }) ?? [],
      ),
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
              const { id, person, company, position } = favorite;
              return (
                <DraggableItem
                  key={id}
                  draggableId={id}
                  index={index}
                  itemComponent={
                    <>
                      {position}
                      {person && (
                        <NavItem
                          key={id}
                          label={`${person.firstName} ${person.lastName}`}
                          Icon={() => (
                            <Avatar
                              colorId={person.id}
                              avatarUrl={person.avatarUrl ?? ''}
                              type="rounded"
                              placeholder={`${person.firstName} ${person.lastName}`}
                            />
                          )}
                          to={`/person/${person.id}`}
                        />
                      )}
                      {company && (
                        <NavItem
                          key={id}
                          label={company.name}
                          Icon={() => (
                            <Avatar
                              avatarUrl={
                                getLogoUrlFromDomainName(company.domainName) ??
                                ''
                              }
                              type="squared"
                              placeholder={company.name}
                            />
                          )}
                          to={`/companies/${company.id}`}
                        />
                      )}
                    </>
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
