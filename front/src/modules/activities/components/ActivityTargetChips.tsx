import styled from '@emotion/styled';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { Company, Person } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ActivityTargetChips = ({
  targets,
}: {
  targets?: Array<
    Pick<ActivityTarget, 'id'> & {
      person?: Pick<
        Person,
        'id' | 'firstName' | 'lastName' | 'avatarUrl'
      > | null;
      company?: Pick<Company, 'id' | 'domainName' | 'name'> | null;
    }
  > | null;
}) => {
  if (!targets) {
    return null;
  }

  return (
    <StyledContainer>
      {targets.map(({ company, person }) => {
        if (company) {
          return (
            <CompanyChip
              key={company.id}
              id={company.id}
              name={company.name}
              pictureUrl={getLogoUrlFromDomainName(company.domainName)}
            />
          );
        }
        if (person) {
          return (
            <PersonChip
              key={person.id}
              id={person.id}
              name={person.firstName + ' ' + person.lastName}
              pictureUrl={person.avatarUrl ?? undefined}
            />
          );
        }
        return <></>;
      })}
    </StyledContainer>
  );
};
