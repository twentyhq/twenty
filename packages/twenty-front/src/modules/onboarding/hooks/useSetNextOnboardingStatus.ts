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

import { useStore } from 'jotai';
import { useCallback } from 'react';
import { OnboardingStatus } from '~/generated-metadata/graphql';

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

  const statusAfterInviteTeam =
    isBookCallRequired && isPlanRequired
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
    return statusAfterInviteTeam;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.INVITE_TEAM) {
    return statusAfterInviteTeam;
  }
  if (
    currentUser?.onboardingStatus === OnboardingStatus.BOOK_CALL ||
    currentUser?.onboardingStatus === OnboardingStatus.PLAN_REQUIRED
  ) {
    return statusAfterBookCall;
  }
  return OnboardingStatus.COMPLETED;
};

export const useSetNextOnboardingStatus = () => {
  const store = useStore();

  return useCallback(() => {
    const currentUser = store.get(currentUserState.atom);
    const currentWorkspace = store.get(currentWorkspaceState.atom);

    const nextOnboardingStatus = getNextOnboardingStatus({
      currentUser,
      currentWorkspace,
      isBillingEnabled: store.get(billingState.atom)?.isBillingEnabled ?? false,
      isBookCallRequired: getIsBookCallRequired({
        companyEnrichment: store.get(companyEnrichmentState.atom),
        bookCallMinEmployeeCount: store.get(bookCallMinEmployeeCountState.atom),
        calendarBookingPageId: store.get(calendarBookingPageIdState.atom),
      }),
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
        store.get(isOnboardingAiChatEnabledState.atom),
      );
    }
  }, [store]);
};
