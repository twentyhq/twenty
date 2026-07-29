import { getCalApi } from '@calcom/embed-react';
import { useEffect, useState } from 'react';

import { OnboardingSkipButton } from '@/onboarding/components/OnboardingSkipButton';
import { useCompleteBookCallOnboardingStep } from '@/onboarding/hooks/useCompleteBookCallOnboardingStep';

export const BookCallOnboardingStepActions = () => {
  const completeBookCallOnboardingStep = useCompleteBookCallOnboardingStep();
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    let calApi: Awaited<ReturnType<typeof getCalApi>> | undefined;

    const onBookingSuccessful = () => {
      void completeBookCallOnboardingStep();
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
