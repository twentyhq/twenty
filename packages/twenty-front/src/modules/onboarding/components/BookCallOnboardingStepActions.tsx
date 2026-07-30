import { getCalApi } from '@calcom/embed-react';
import { useEffect, useState } from 'react';

import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';

export const BookCallOnboardingStepActions = () => {
  const completeBookCallOnboardingStep = useCompleteBookCallOnboardingStep();
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    let hasHandledBookingSuccess = false;
    let calApi: Awaited<ReturnType<typeof getCalApi>> | undefined;

    // The embed can emit the event more than once, and completing the step also
    // disables Skip so the two entry points cannot both advance the flow.
    const onBookingSuccessful = () => {
      if (hasHandledBookingSuccess) {
        return;
      }

      hasHandledBookingSuccess = true;

      void (async () => {
        setIsCompleting(true);

        try {
          await completeBookCallOnboardingStep();
        } catch {
          // The call is already booked on Cal's side and the step is still pending
          // server-side, so there is nothing to warn about: re-enable Skip and let the
          // user move on themselves.
          hasHandledBookingSuccess = false;
          setIsCompleting(false);
        }
      })();
    };

    const subscribeToBookingSuccess = async () => {
      const api = await getCalApi();

      if (!isSubscribed) {
        return;
      }

      calApi = api;
      api('on', {
        action: 'bookingSuccessfulV2',
        callback: onBookingSuccessful,
      });
    };

    void subscribeToBookingSuccess();

    // Unsubscribing matters: without it every re-render would stack another
    // listener and a single booking would fire the mutation several times.
    return () => {
      isSubscribed = false;
      calApi?.('off', {
        action: 'bookingSuccessfulV2',
        callback: onBookingSuccessful,
      });
    };
  }, [completeBookCallOnboardingStep]);

  const handleSkip = async () => {
    setIsCompleting(true);

    try {
      await completeBookCallOnboardingStep();
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <OnboardingSkipButton
      onClick={() => void handleSkip()}
      disabled={isCompleting}
    />
  );
};
