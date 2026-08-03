import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useCallback, useState } from 'react';

import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const BookCallOnboardingStepActions = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const completeBookCallOnboardingStep = useCompleteBookCallOnboardingStep();
  const [isCompleting, setIsCompleting] = useState(false);

  // Kept stable so BookCallBookingSuccessEffect subscribes to the embed once
  // instead of cycling its listener on every render.
  const completeStep = useCallback(async () => {
    setIsCompleting(true);

    try {
      await completeBookCallOnboardingStep();
    } catch (error) {
      setIsCompleting(false);

      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  }, [completeBookCallOnboardingStep, enqueueErrorSnackBar]);

  return (
    <>
      <BookCallBookingSuccessEffect onBookingSuccessful={completeStep} />
      <OnboardingSkipButton
        onClick={() => void completeStep()}
        disabled={isCompleting}
      />
    </>
  );
};
