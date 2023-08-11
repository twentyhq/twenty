import styled from '@emotion/styled';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { ActivityTarget, Company, Person } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export function ActivityTargetChips({
  targets,
}: {
  targets?: Array<
    Pick<ActivityTarget, 'id'> & {
      person?: Pick<Person, 'id' | 'displayName' | 'avatarUrl'> | null;
      company?: Pick<Company, 'id' | 'domainName' | 'name'> | null;
    }
  > | null;
}) {
  if (!targets) {
    return null;
  }

  return (
    <StyledContainer>
      {targets
        .filter(({ company }) => company !== null)
        .map(({ company }) => (
          <CompanyChip
            key={company?.id}
            id={company?.id ?? ''}
            name={company?.name ?? ''}
            pictureUrl={getLogoUrlFromDomainName(company?.domainName)}
          />
        ))}
      {targets
        .filter(({ person }) => person !== null)
        .map(({ person }) => (
          <PersonChip
            key={person?.id}
            id={person?.id ?? ''}
            name={person?.displayName ?? ''}
            pictureUrl={person?.avatarUrl ?? ''}
          />
        ))}
    </StyledContainer>
  );
}
