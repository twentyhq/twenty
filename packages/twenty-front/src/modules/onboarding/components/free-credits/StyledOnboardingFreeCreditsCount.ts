import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledOnboardingFreeCreditsCount = styled.span`
  align-items: baseline;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.medium};
`;
