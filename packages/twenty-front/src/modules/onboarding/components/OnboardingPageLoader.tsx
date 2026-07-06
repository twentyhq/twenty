import { isOnOnboardingVerifyPath } from '@/auth/utils/isOnOnboardingVerifyPath';
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

// The verify screen renders its own pulsing logo, so the loader shown before it
// omits the logo to avoid a double-logo flash on cold boot into the verify step.
export const OnboardingPageLoader = () => (
  <StyledContainer>
    {!isOnOnboardingVerifyPath(window.location.pathname) && (
      <OnboardingPulsingLogo />
    )}
  </StyledContainer>
);
