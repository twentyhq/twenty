import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledFieldInputDetails = styled.div<{
  hasSeparator?: boolean;
}>`
  border-top: ${({ hasSeparator = true }) =>
    hasSeparator
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
  padding: ${themeCssVariables.spacing[2]};
`;
