import { OnboardingHeader } from '@/onboarding/components/OnboardingHeader';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackground = styled.div`
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
`;

export const OnboardingStepLayout = () => {
  const freeCredits = useOnboardingFreeCreditsTotal();

  return (
    <StyledBackground>
      <OnboardingHeader freeCredits={freeCredits} />
      <OnboardingTransitionOutlet />
    </StyledBackground>
  );
};
