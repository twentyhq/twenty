import { getCalApi } from '@calcom/embed-react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { getIsBookCallOnboardingStepPending } from '@/onboarding/utils/getIsBookCallOnboardingStepPending';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const usePreloadCalForBookCallStep = () => {
  const isBookCallOnboardingStepEnabled = useAtomStateValue(
    isBookCallOnboardingStepEnabledState,
  );
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const currentUser = useAtomStateValue(currentUserState);

  const isBookCallOnboardingStepPending =
    getIsBookCallOnboardingStepPending(currentUser);

  useEffect(() => {
    if (
      !isBookCallOnboardingStepEnabled ||
      !isBookCallOnboardingStepPending ||
      !isNonEmptyString(calendarBookingPageId)
    ) {
      return;
    }

    // Warms the Cal.com embed script and the booking page itself while the user
    // is still on an earlier step, so the embed is not fetched from scratch.
    const preloadBookingPage = async () => {
      try {
        const calApi = await getCalApi();

        calApi('preload', { calLink: calendarBookingPageId });
      } catch {
        return;
      }
    };

    void preloadBookingPage();
  }, [
    isBookCallOnboardingStepEnabled,
    isBookCallOnboardingStepPending,
    calendarBookingPageId,
  ]);
};
