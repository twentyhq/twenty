import { styled } from '@linaria/react';
import { useRef } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { OnboardingConstructionSiteCanvasEffect } from '@/onboarding/components/OnboardingConstructionSite/OnboardingConstructionSiteCanvasEffect';
import { getOnboardingConstructionSiteStage } from '@/onboarding/components/OnboardingConstructionSite/getOnboardingConstructionSiteStage';
import { getIsBookCallOnboardingStepPending } from '@/onboarding/utils/getIsBookCallOnboardingStepPending';
import { getIsLastOnboardingStep } from '@/onboarding/utils/getIsLastOnboardingStep';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables, useThemeColorScheme } from 'twenty-ui/theme';

const StyledCanvas = styled.canvas`
  animation: onboardingConstructionSiteIn 0.8s ease-out both;
  color: color-mix(
    in srgb,
    ${themeCssVariables.border.color.medium} 50%,
    ${themeCssVariables.border.color.strong} 50%
  );
  display: block;
  height: 100%;
  width: 100%;

  @keyframes onboardingConstructionSiteIn {
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

export const OnboardingConstructionSite = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBookCallOnboardingStepEnabled = useAtomStateValue(
    isBookCallOnboardingStepEnabledState,
  );
  const colorScheme = useThemeColorScheme();

  const { stageIndex, isFinale } = getOnboardingConstructionSiteStage({
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
      <OnboardingConstructionSiteCanvasEffect
        canvasRef={canvasRef}
        stageIndex={stageIndex}
        isFinale={isFinale}
        colorScheme={colorScheme}
      />
    </>
  );
};
