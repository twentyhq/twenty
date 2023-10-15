import { useCallback, useState } from 'react';
import React from 'react';
import styled from '@emotion/styled';
import { OnDragEndResponder } from '@hello-pangea/dnd';

import { DraggableItem } from '@/ui/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/draggable-list/components/DraggableList';
import NavItem from '@/ui/navbar/components/NavItem';
import NavTitle from '@/ui/navbar/components/NavTitle';
import { Avatar } from '@/users/components/Avatar';
import { GetFavoritesQuery, useGetFavoritesQuery } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { useFavorites } from '../hooks/useFavorites';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: auto;
  width: 100%;
`;

export const Favorites = () => {
  const { updateFavoritesOrder } = useFavorites();

  const [favorites, setFavorites] = useState<
    GetFavoritesQuery['findFavorites']
  >([]);

  useGetFavoritesQuery({
    onCompleted: (data) => setFavorites(data?.findFavorites ?? []),
  });

  const handleReorderField: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination || !favorites) {
        return;
      }
      const reorderFavorites = Array.from(favorites);
      const [removed] = reorderFavorites.splice(result.source.index, 1);
      reorderFavorites.splice(result.destination.index, 0, removed);
      setFavorites(reorderFavorites);

      updateFavoritesOrder(reorderFavorites);
    },
    [favorites, setFavorites, updateFavoritesOrder],
  );

  if (!favorites || favorites.length === 0) return <></>;

  return (
    <StyledContainer>
      <NavTitle label="Favorites" />
      <DraggableList
        onDragEnd={handleReorderField}
        draggableItems={
          <>
            {favorites.map((item, index) => {
              const { id, person, company } = item;
              return (
                <DraggableItem
                  key={id}
                  draggableId={id}
                  index={index}
                  itemComponent={
                    <>
                      {(person && (
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
                          isDraggable={true}
                        />
                      )) ??
                        (company && (
                          <NavItem
                            key={id}
                            label={company.name}
                            Icon={() => (
                              <Avatar
                                avatarUrl={
                                  getLogoUrlFromDomainName(
                                    company.domainName,
                                  ) ?? ''
                                }
                                type="squared"
                                placeholder={company.name}
                              />
                            )}
                            to={`/companies/${company.id}`}
                            isDraggable={true}
                          />
                        ))}
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
