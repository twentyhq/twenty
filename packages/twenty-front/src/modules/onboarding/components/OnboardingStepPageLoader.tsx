import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  flex: 1;
  min-height: 0;
  width: 100%;
`;

export const OnboardingStepPageLoader = () => <StyledContainer />;
