import { IconLock } from 'twenty-ui/display';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPillContainer = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 40px;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

export const OrganizationAdornment = () => (
  <StyledPillContainer>
    <IconLock size={12} />
    {t`Organization`}
  </StyledPillContainer>
);
