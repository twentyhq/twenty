import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';

import { favoritesState } from '@/favorites/states/favoritesState';
import { mapFavorites } from '@/favorites/utils/mapFavorites';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import NavTitle from '@/ui/navigation/navbar/components/NavTitle';
import { Avatar } from '@/users/components/Avatar';
import { Company, Favorite } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useFavorites } from '../hooks/useFavorites';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  width: 100%;
`;

export const Favorites = () => {
  const { favorites, handleReorderFavorite } = useFavorites();
  const [allCompanies, setAllCompanies] = useState<
    Record<string, { name: string; domainName?: string }>
  >({});
  const [allPeople, setAllPeople] = useState<
    Record<string, { firstName: string; lastName: string; avatarUrl?: string }>
  >({});

  // This is only temporary and will be refactored once we have main identifiers
  const { loading: companiesLoading } = useFindManyObjectRecords({
    objectNamePlural: 'companiesV2',
    onCompleted: async (
      data: PaginatedObjectTypeResults<Required<Company>>,
    ) => {
      setAllCompanies(
        data.edges.reduce(
          (acc, { node: company }) => ({
            ...acc,
            [company.id]: {
              name: company.name,
              domainName: company.domainName,
            },
          }),
          {},
        ),
      );
    },
  });

  const { loading: peopleLoading } = useFindManyObjectRecords({
    objectNamePlural: 'peopleV2',
    onCompleted: async (data) => {
      setAllPeople(
        data.edges.reduce(
          (acc, { node: person }) => ({
            ...acc,
            [person.id]: {
              firstName: person.firstName,
              lastName: person.lastName,
              avatarUrl: person.avatarUrl,
            },
          }),
          {},
        ),
      );
    },
  });

  useFindManyObjectRecords({
    skip: companiesLoading || peopleLoading,
    objectNamePlural: 'favoritesV2',
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<Required<Favorite>>) => {
          const favoriteState = snapshot.getLoadable(favoritesState);
          const favorites = favoriteState.getValue();

          const queriedFavorites = mapFavorites(data.edges, {
            ...allCompanies,
            ...allPeople,
          });
          if (!isDeeplyEqual(favorites, queriedFavorites)) {
            set(favoritesState, queriedFavorites);
          }
        },
      [allCompanies, allPeople],
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
              const { id, labelIdentifier, avatarUrl, avatarType, link } =
                favorite;

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
                          colorId={id}
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
