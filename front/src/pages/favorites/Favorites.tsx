import styled from '@emotion/styled';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { useFavorites } from '@/favorites/hooks/useSetFavorites';
import { PersonChip } from '@/people/components/PersonChip';
import { ChipSize } from '@/ui/chip/components/Chip';
import { EntityChipVariant } from '@/ui/chip/components/EntityChip';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 150px;
  overflow-x: auto;
  width: 100%;
`;

export function Favorites() {
  const data = useFavorites();
  return (
    <Wrapper>
      {data &&
        data.findFavorites.map(
          ({ id, person, company }) =>
            (person && (
              <PersonChip
                id={person.id}
                name={`${person.firstName} ${person.lastName}`}
                key={id}
                variant={EntityChipVariant.Transparent}
                size={ChipSize.Large}
                avatarSize={20}
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
                avatarSize={20}
              />
            )),
        )}
    </Wrapper>
  );
}
