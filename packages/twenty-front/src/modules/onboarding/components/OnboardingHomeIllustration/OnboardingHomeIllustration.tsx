import { styled } from '@linaria/react';
import { useRef } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { OnboardingHomeIllustrationCanvasEffect } from '@/onboarding/components/OnboardingHomeIllustration/OnboardingHomeIllustrationCanvasEffect';
import { getOnboardingHomeIllustrationStage } from '@/onboarding/components/OnboardingHomeIllustration/getOnboardingHomeIllustrationStage';
import { getIsBookCallOnboardingStepPending } from '@/onboarding/utils/getIsBookCallOnboardingStepPending';
import { getIsLastOnboardingStep } from '@/onboarding/utils/getIsLastOnboardingStep';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import '@/onboarding/components/WelcomeOverlay/welcomeHalftone.css';

const StyledCanvas = styled.canvas`
  animation: onboardingHomeIllustrationIn 0.6s ease-out both;
  display: block;
  height: 100%;
  width: 100%;

  @keyframes onboardingHomeIllustrationIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const OnboardingHomeIllustration = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBookCallOnboardingStepEnabled = useAtomStateValue(
    isBookCallOnboardingStepEnabledState,
  );

  const { revealedFurnitureCount, isFinale } =
    getOnboardingHomeIllustrationStage({
      onboardingStatus: currentUser?.onboardingStatus,
      isLastOnboardingStep: getIsLastOnboardingStep({
        currentUser,
        currentWorkspace,
        isBillingEnabled: billing?.isBillingEnabled ?? false,
        isBookCallRequired:
          isBookCallOnboardingStepEnabled &&
          getIsBookCallOnboardingStepPending(currentUser),
      }),
    });

  return (
    <>
      <StyledCanvas ref={canvasRef} aria-hidden="true" />
      <OnboardingHomeIllustrationCanvasEffect
        canvasRef={canvasRef}
        revealedFurnitureCount={revealedFurnitureCount}
        isFinale={isFinale}
      />
    </>
  );
};
