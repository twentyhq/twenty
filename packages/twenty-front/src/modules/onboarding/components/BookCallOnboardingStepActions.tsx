import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useState } from 'react';

import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const BookCallOnboardingStepActions = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const completeBookCallOnboardingStep = useCompleteBookCallOnboardingStep();
  const [isCompleting, setIsCompleting] = useState(false);

  const completeStep = async () => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);

    try {
      await completeBookCallOnboardingStep();
    } catch (error) {
      setIsCompleting(false);

      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

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
