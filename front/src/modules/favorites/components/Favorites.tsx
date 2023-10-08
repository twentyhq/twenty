import { useEffect, useState } from 'react';
import React from 'react';
import styled from '@emotion/styled';
import { Reorder } from 'framer-motion';

import NavItem from '@/ui/navbar/components/NavItem';
import NavTitle from '@/ui/navbar/components/NavTitle';
import { Avatar } from '@/users/components/Avatar';
import { useGetFavoritesQuery } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { useFavorites } from '../hooks/useFavorites';

const StyledContainer = styled.div`
  /* display: ; */
  /* flex-direction: column; */
  height: 100%;
  overflow-x: auto;
  width: 100%;
`;

export const Favorites = () => {
  const { data } = useGetFavoritesQuery();
  const { updateFavoritesOrder } = useFavorites();

  const [favorites, setFavorites] = useState(data?.findFavorites);

  useEffect(() => {
    const _favorites = data?.findFavorites;
    const _finalFav = _favorites ? Array.from(_favorites) : [];
    setFavorites(_finalFav);
  }, [data?.findFavorites]);

  const handleReorderField = (draggedItemId: string, dropIndex: number) => {
    if (!draggedItemId) {
      return;
    }
    updateFavoritesOrder(draggedItemId, dropIndex);
  };
  if (!favorites || favorites.length === 0) return <></>;

  return (
    <StyledContainer>
      <NavTitle label="Favorites" />
      <Reorder.Group
        axis="y"
        values={favorites}
        onReorder={setFavorites}
        as="div"
      >
        {favorites.map((item, index) => {
          const { id, person, company } = item;
          return (
            <Reorder.Item
              id={id}
              key={id}
              value={item}
              as="div"
              onDragEnd={() => handleReorderField(id, index)}
            >
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
                          getLogoUrlFromDomainName(company.domainName) ?? ''
                        }
                        type="squared"
                        placeholder={company.name}
                      />
                    )}
                    to={`/companies/${company.id}`}
                    isDraggable={true}
                  />
                ))}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </StyledContainer>
  );
};
