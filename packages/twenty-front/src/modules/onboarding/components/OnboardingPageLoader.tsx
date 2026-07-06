import { OnboardingPulsingLogo } from '@/onboarding/components/OnboardingPulsingLogo';
import { ONBOARDING_ACTIVATION_STEPS_HEIGHT_IN_PX } from '@/onboarding/constants/OnboardingActivationStepsHeight';
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

// Reserve the activation-message area so the pulsing logo keeps its position
// when the verify screen replaces this loader on cold boot.
const StyledMessagePlaceholder = styled.div`
  height: ${ONBOARDING_ACTIVATION_STEPS_HEIGHT_IN_PX}px;
`;

export const OnboardingPageLoader = () => (
  <StyledContainer>
    <OnboardingPulsingLogo />
    <StyledMessagePlaceholder />
  </StyledContainer>
);
