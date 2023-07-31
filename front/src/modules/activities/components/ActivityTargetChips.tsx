import styled from '@emotion/styled';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { GetCompaniesQuery, GetPeopleQuery } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export function ActivityTargetChips({
  targetCompanies,
  targetPeople,
}: {
  targetCompanies?: GetCompaniesQuery;
  targetPeople?: GetPeopleQuery;
}) {
  return (
    <StyledContainer>
      {targetCompanies?.companies &&
        targetCompanies.companies.map((company) => (
          <CompanyChip
            key={company.id}
            id={company.id}
            name={company.name}
            pictureUrl={getLogoUrlFromDomainName(company.domainName)}
          />
        ))}
      {targetPeople?.people &&
        targetPeople.people.map((person) => (
          <PersonChip
            key={person.id}
            id={person.id}
            name={person.displayName}
            pictureUrl={person.avatarUrl ?? ''}
          />
        ))}
    </StyledContainer>
  );
}
