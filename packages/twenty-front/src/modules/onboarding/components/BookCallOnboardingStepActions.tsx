import { useCallback, useState } from 'react';

import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';

export const BookCallOnboardingStepActions = () => {
  const completeBookCallOnboardingStep = useCompleteBookCallOnboardingStep();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleSkip = async () => {
    setIsCompleting(true);

    try {
      await completeBookCallOnboardingStep();
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBookingSuccessful = useCallback(() => {
    void (async () => {
      setIsCompleting(true);

      try {
        await completeBookCallOnboardingStep();
      } catch {
        setIsCompleting(false);
      }
    })();
  }, [completeBookCallOnboardingStep]);

  return (
    <>
      <BookCallBookingSuccessEffect
        onBookingSuccessful={handleBookingSuccessful}
      />
      <OnboardingSkipButton
        onClick={() => void handleSkip()}
        disabled={isCompleting}
      />
    </>
  );
};
