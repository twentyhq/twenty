import { GettingStartedAppRow } from '@/getting-started/components/GettingStartedAppRow';
import { styled } from '@linaria/react';
import { GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const GettingStartedAppsAction = () => (
  <StyledColumn>
    {GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) => (
      <GettingStartedAppRow
        key={universalIdentifier}
        universalIdentifier={universalIdentifier}
      />
    ))}
  </StyledColumn>
);
