import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useCallback, useState } from 'react';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';
import { useToast } from 'twenty-ui/feedback';

export const BookCallOnboardingStepActions = () => {
  const { enqueueToast } = useToast();
  const completeBookCallOnboardingStep = useCompleteBookCallOnboardingStep();
  const [isCompleting, setIsCompleting] = useState(false);

  // Kept stable so BookCallBookingSuccessEffect subscribes to the embed once
  // instead of cycling its listener on every render.
  const completeStep = useCallback(
    async ({ hasBookedCall }: { hasBookedCall: boolean }) => {
      setIsCompleting(true);

      try {
        await completeBookCallOnboardingStep({ hasBookedCall });
      } catch (error) {
        setIsCompleting(false);

        enqueueToast(
          getToastOptionsFromError({
            error: CombinedGraphQLErrors.is(error) ? error : undefined,
          }),
        );
      }
    },
    [completeBookCallOnboardingStep, enqueueToast],
  );

  const completeStepAfterBooking = useCallback(() => {
    void completeStep({ hasBookedCall: true });
  }, [completeStep]);

  return (
    <>
      <BookCallBookingSuccessEffect
        onBookingSuccessful={completeStepAfterBooking}
      />
      <OnboardingSkipButton
        onClick={() => void completeStep({ hasBookedCall: false })}
        disabled={isCompleting}
      />
    </>
  );
};
