import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { currentFavorites } from '@/favorites/states/currentFavorites';
import { PersonChip } from '@/people/components/PersonChip';
import { ChipSize } from '@/ui/chip/components/Chip';
import { EntityChipVariant } from '@/ui/chip/components/EntityChip';
import { useGetFavoritesQuery } from '~/generated/graphql';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 150px;
  overflow-x: auto;
  width: 100%;
`;

export function Favorites() {
  const [favorites, setFavorites] = useRecoilState(currentFavorites);
  const { data } = useGetFavoritesQuery();
  useEffect(() => {
    if (data) setFavorites(data.findFavorites);
  }, [data, setFavorites]);
  return (
    <Wrapper>
      {favorites &&
        favorites.map(
          ({ id, person, company }) =>
            (person && (
              <PersonChip
                id={person.id}
                name={`${person.firstName} ${person.lastName}`}
                key={id}
                variant={EntityChipVariant.Transparent}
                size={ChipSize.Large}
                avatarSize="md"
                pictureUrl={person?.avatarUrl ?? ''}
              />
            )) ||
            (company && (
              <CompanyChip
                id={company.id}
                name={company.name}
                key={id}
                pictureUrl={company?.accountOwner?.avatarUrl ?? ''}
                variant={EntityChipVariant.Transparent}
                size={ChipSize.Large}
                avatarSize="md"
              />
            )),
        )}
    </Wrapper>
  );
}
