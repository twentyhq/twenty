import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  height: 100dvh;
  width: 100%;
`;

export const OnboardingPageLoader = () => <StyledContainer />;
