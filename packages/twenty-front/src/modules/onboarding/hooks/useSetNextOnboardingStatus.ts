import { isDefined } from 'twenty-shared/utils';

import {
  type CurrentUser,
  currentUserState,
} from '@/auth/states/currentUserState';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { bookCallMinEmployeeCountState } from '@/client-config/states/bookCallMinEmployeeCountState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { getHasJustCompletedOnboarding } from '@/onboarding/utils/getHasJustCompletedOnboarding';
import { getIsBookCallRequired } from '@/onboarding/utils/getIsBookCallRequired';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useCallback } from 'react';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { useStore } from 'jotai';

type GetNextOnboardingStatusArgs = {
  currentUser: CurrentUser | null;
  currentWorkspace: CurrentWorkspace | null;
  isBillingEnabled: boolean;
  isBookCallRequired: boolean;
};

const getNextOnboardingStatus = ({
  currentUser,
  currentWorkspace,
  isBillingEnabled,
  isBookCallRequired,
}: GetNextOnboardingStatusArgs) => {
  const isPlanRequired = getIsPlanRequired({
    isBillingEnabled,
    currentWorkspace,
  });

  const statusAfterBookCall = isPlanRequired
    ? OnboardingStatus.PLAN_REQUIRED
    : OnboardingStatus.COMPLETED;

  const statusBeforePlan = isBookCallRequired
    ? OnboardingStatus.BOOK_CALL
    : statusAfterBookCall;

  if (currentUser?.onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION) {
    return OnboardingStatus.SYNC_EMAIL;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.SYNC_EMAIL) {
    if (currentWorkspace?.workspaceMembersCount === 1) {
      return OnboardingStatus.APPS_INSTALLATION;
    }
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.APPS_INSTALLATION) {
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.PROFILE_CREATION) {
    if (currentWorkspace?.workspaceMembersCount === 1) {
      return OnboardingStatus.INVITE_TEAM;
    }
    return statusBeforePlan;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.INVITE_TEAM) {
    return statusBeforePlan;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.BOOK_CALL) {
    return statusAfterBookCall;
  }
  // Advancing from the plan step must not assume the plan was paid for: falling through
  // to COMPLETED here would let a caller wave the paywall through.
  if (currentUser?.onboardingStatus === OnboardingStatus.PLAN_REQUIRED) {
    return statusAfterBookCall;
  }
  return OnboardingStatus.COMPLETED;
};

export const useSetNextOnboardingStatus = () => {
  const store = useStore();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const isOnboardingAiChatEnabled = useAtomStateValue(
    isOnboardingAiChatEnabledState,
  );
  return useCallback(() => {
    // Read at call time, not render time: a caller may have awaited the company
    // enrichment before advancing, and a value captured at render would still be the
    // stale null that made us skip the book-a-call step.
    const isBookCallRequired = getIsBookCallRequired({
      companyEnrichment: store.get(companyEnrichmentState.atom),
      bookCallMinEmployeeCount: store.get(bookCallMinEmployeeCountState.atom),
      calendarBookingPageId: store.get(calendarBookingPageIdState.atom),
    });

    const nextOnboardingStatus = getNextOnboardingStatus({
      currentUser,
      currentWorkspace,
      isBillingEnabled,
      isBookCallRequired,
    });
    store.set(currentUserState.atom, (current) => {
      if (isDefined(current)) {
        return {
          ...current,
          onboardingStatus: nextOnboardingStatus,
        };
      }
      return current;
    });

    if (
      getHasJustCompletedOnboarding({
        previousOnboardingStatus: currentUser?.onboardingStatus,
        nextOnboardingStatus,
      })
    ) {
      store.set(isWelcomeAnimationVisibleState.atom, true);
      store.set(
        shouldOpenAiChatAfterOnboardingState.atom,
        isOnboardingAiChatEnabled,
      );
    }
  }, [
    currentUser,
    currentWorkspace,
    isBillingEnabled,
    isOnboardingAiChatEnabled,
    store,
  ]);
};
