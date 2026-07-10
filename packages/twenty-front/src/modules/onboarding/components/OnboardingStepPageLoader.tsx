import { OnboardingPulsingLogo } from '@/onboarding/components/OnboardingPulsingLogo';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 0;
  width: 100%;
`;

export const OnboardingStepPageLoader = () => (
  <StyledContainer>
    <OnboardingPulsingLogo />
  </StyledContainer>
);
