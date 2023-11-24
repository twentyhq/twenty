import styled from '@emotion/styled';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { getLogoUrlFromDomainName } from '~/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

// TODO: fix edges pagination formatting on n+N
export const ActivityTargetChips = ({ targets }: { targets?: any }) => {
  if (!targets) {
    return null;
  }

  return (
    <StyledContainer>
      {targets?.map(({ company, person }: any) => {
        if (company) {
          return (
            <CompanyChip
              key={company.id}
              id={company.id}
              name={company.name}
              avatarUrl={getLogoUrlFromDomainName(company.domainName)}
            />
          );
        }
        if (person) {
          return (
            <PersonChip
              key={person.id}
              id={person.id}
              name={person.name.firstName + ' ' + person.name.lastName}
              avatarUrl={person.avatarUrl ?? undefined}
            />
          );
        }
        return <></>;
      })}
    </StyledContainer>
  );
};
