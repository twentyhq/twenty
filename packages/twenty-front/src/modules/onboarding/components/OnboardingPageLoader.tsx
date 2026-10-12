import { isOnOnboardingVerifyPath } from '@/auth/utils/isOnOnboardingVerifyPath';
import { OnboardingPulsingLogo } from '@/onboarding/components/OnboardingPulsingLogo';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: calc(100dvh / var(--t-zoom, 1));
  justify-content: center;
  width: 100%;
`;

// No logo: the verify screen renders its own, which would flash twice on cold boot.
export const OnboardingPageLoader = () => (
  <StyledContainer>
    {!isOnOnboardingVerifyPath(window.location.pathname) && (
      <OnboardingPulsingLogo />
    )}
  </StyledContainer>
);
