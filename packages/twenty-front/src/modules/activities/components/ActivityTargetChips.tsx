import styled from '@emotion/styled';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { EntityChip } from '@/ui/display/chip/components/EntityChip';
import { getLogoUrlFromDomainName } from '~/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

// TODO: fix edges pagination formatting on n+N
export const ActivityTargetChips = ({
  activityTargets,
}: {
  activityTargets?: ActivityTarget[];
}) => {
  console.log({
    activityTargets,
  });

  return (
    <StyledContainer>
      {activityTargets?.map((activityTarget) => {
        if (activityTarget.company) {
          return (
            <CompanyChip
              key={activityTarget.company.id}
              id={activityTarget.company.id}
              name={activityTarget.company.name}
              avatarUrl={getLogoUrlFromDomainName(
                activityTarget.company.domainName,
              )}
            />
          );
        } else if (activityTarget.person) {
          return (
            <PersonChip
              key={activityTarget.person.id}
              id={activityTarget.person.id}
              name={
                activityTarget.person.name.firstName +
                ' ' +
                activityTarget.person.name.lastName
              }
              avatarUrl={activityTarget.person.avatarUrl ?? undefined}
            />
          );
        } else {
          console.log({
            activityTarget,
          });
          return (
            <EntityChip
              entityId={activityTarget.id}
              name={activityTarget.name}
            />
          );
        }
      })}
    </StyledContainer>
  );
};
