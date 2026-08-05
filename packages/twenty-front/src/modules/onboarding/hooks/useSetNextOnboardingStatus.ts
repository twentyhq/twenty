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
import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { getHasJustCompletedOnboarding } from '@/onboarding/utils/getHasJustCompletedOnboarding';
import { getIsBookCallOnboardingStepPending } from '@/onboarding/utils/getIsBookCallOnboardingStepPending';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { getNextPreviousOnboardingStatus } from '@/onboarding/utils/getNextPreviousOnboardingStatus';
import { type OnboardingStepHistoryEffect } from '@/onboarding/types/OnboardingStepHistoryEffect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const isOnboardingAiChatEnabled = useAtomStateValue(
    isOnboardingAiChatEnabledState,
  );

  return useCallback(
    ({
      stepHistoryEffect,
    }: {
      stepHistoryEffect: OnboardingStepHistoryEffect;
    }) => {
      const nextOnboardingStatus = getNextOnboardingStatus({
        currentUser,
        currentWorkspace,
        isBillingEnabled,
        isBookCallRequired:
          store.get(isBookCallOnboardingStepEnabledState.atom) &&
          getIsBookCallOnboardingStepPending(store.get(currentUserState.atom)),
      });

      store.set(onboardingNavigationDirectionState.atom, 'forward');
      store.set(currentUserState.atom, (current) => {
        if (isDefined(current)) {
          return {
            ...current,
            onboardingStatus: nextOnboardingStatus,
            previousOnboardingStatus: getNextPreviousOnboardingStatus({
              stepHistoryEffect,
              currentOnboardingStatus: current.onboardingStatus,
              currentPreviousOnboardingStatus: current.previousOnboardingStatus,
            }),
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
    },
    [
      currentUser,
      currentWorkspace,
      isBillingEnabled,
      isOnboardingAiChatEnabled,
      store,
    ],
  );
};
