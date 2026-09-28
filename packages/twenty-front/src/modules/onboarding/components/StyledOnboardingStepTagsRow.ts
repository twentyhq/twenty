import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledOnboardingStepTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[1]};
`;
