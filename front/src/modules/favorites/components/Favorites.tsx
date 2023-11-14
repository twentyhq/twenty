import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import NavTitle from '@/ui/navigation/navbar/components/NavTitle';
import { Avatar } from '@/users/components/Avatar';
import { Favorite } from '~/generated-metadata/graphql';
import { getLogoUrlFromDomainName } from '~/utils';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useFavorites } from '../hooks/useFavorites';
import { favoritesState } from '../states/favoritesState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  width: 100%;
`;

export const Favorites = () => {
  const [favorites] = useRecoilState(favoritesState);
  const { handleReorderFavorite } = useFavorites();

  useFindManyObjectRecords({
    objectNamePlural: 'favoritesV2',
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<Required<Favorite>>) => {
          const favoriteState = snapshot.getLoadable(favoritesState);
          const favorites = favoriteState.getValue();

          const queriedFavorites = data.edges
            .map(({ node: favorite }) => ({
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
            }))
            .filter(assertNotNull);

          if (!isDeeplyEqual(favorites, queriedFavorites)) {
            set(favoritesState, queriedFavorites);
          }
        },
      [],
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
              const { id, person, company } = favorite;
              return (
                <DraggableItem
                  key={id}
                  draggableId={id}
                  index={index}
                  itemComponent={
                    <>
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
