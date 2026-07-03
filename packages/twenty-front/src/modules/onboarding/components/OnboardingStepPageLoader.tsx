import { OnboardingPulsingLogo } from '@/onboarding/components/OnboardingPulsingLogo';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  align-items: center;
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
