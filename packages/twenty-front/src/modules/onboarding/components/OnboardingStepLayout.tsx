import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingLayout } from '@/onboarding/components/OnboardingLayout';
import { OnboardingTransitionOutlet } from '@/onboarding/components/OnboardingTransitionOutlet';
import { OnboardingHeaderFreeCredits } from '@/onboarding/components/free-credits/OnboardingHeaderFreeCredits';
import { PrefetchBookCallStepEffect } from '@/onboarding/effect-components/PrefetchBookCallStepEffect';
import { PrefetchPlanRequiredStepEffect } from '@/onboarding/effect-components/PrefetchPlanRequiredStepEffect';
import { useGoBackToPreviousOnboardingStep } from '@/onboarding/hooks/useGoBackToPreviousOnboardingStep';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { isDefined } from 'twenty-shared/utils';

// Loaded on demand: this layout is part of the workspace router, so a static
// import would put the renderer, the shaders and the mesh data (built when the
// module is evaluated) in the entry chunk of every app load, while only
// onboarding on wide screens ever mounts the construction site.
const OnboardingConstructionSite = lazy(() =>
  import('@/onboarding/components/OnboardingConstructionSite/OnboardingConstructionSite').then(
    (module) => ({ default: module.OnboardingConstructionSite }),
  ),
);

export const OnboardingStepLayout = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const {
    goBackToPreviousOnboardingStep,
    isGoingBackToPreviousOnboardingStep,
  } = useGoBackToPreviousOnboardingStep();

  const hasPreviousOnboardingStep = isDefined(
    currentUser?.previousOnboardingStatus,
  );

  return (
    <OnboardingLayout
      onBack={
        hasPreviousOnboardingStep
          ? () => {
              void goBackToPreviousOnboardingStep();
            }
          : undefined
      }
      isBackDisabled={isGoingBackToPreviousOnboardingStep}
      headerRightComponent={<OnboardingHeaderFreeCredits />}
      backgroundComponent={
        // The background is decorative: if its chunk fails to load (network
        // blip, or a deploy that removed the old chunk) or it throws while
        // rendering, onboarding goes on without it instead of reaching the
        // layout's AppErrorBoundary, which replaces the page and reloads it.
        <ErrorBoundary fallbackRender={() => null}>
          <Suspense fallback={null}>
            <OnboardingConstructionSite />
          </Suspense>
        </ErrorBoundary>
      }
    >
      <PrefetchBookCallStepEffect />
      <PrefetchPlanRequiredStepEffect />
      <OnboardingTransitionOutlet />
    </OnboardingLayout>
  );
};
