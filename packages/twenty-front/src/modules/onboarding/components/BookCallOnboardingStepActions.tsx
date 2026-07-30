import { useCallback, useState } from 'react';

import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';

export const BookCallOnboardingStepActions = () => {
  const completeBookCallOnboardingStep = useCompleteBookCallOnboardingStep();
  const [isCompleting, setIsCompleting] = useState(false);

  const completeStep = useCallback(async () => {
    setIsCompleting(true);

    try {
      await completeBookCallOnboardingStep();
    } catch (error) {
      setIsCompleting(false);

      throw error;
    }
  }, [completeBookCallOnboardingStep]);

  const handleBookingSuccessful = useCallback(() => {
    // The user did not ask for this, so a failure stays silent: skipping remains available.
    void completeStep().catch(() => {});
  }, [completeStep]);

  return (
    <>
      <BookCallBookingSuccessEffect
        onBookingSuccessful={handleBookingSuccessful}
      />
      <OnboardingSkipButton
        onClick={() => void completeStep()}
        disabled={isCompleting}
      />
    </>
  );
};
