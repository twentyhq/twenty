import { OnboardingPulsingLogo } from '@/onboarding/components/OnboardingPulsingLogo';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  justify-content: center;
  width: 100%;
`;

export const OnboardingPageLoader = () => (
  <StyledContainer>
    <OnboardingPulsingLogo />
  </StyledContainer>
);
