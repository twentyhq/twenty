import { isDefined } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { getHasJustCompletedOnboarding } from '@/onboarding/utils/getHasJustCompletedOnboarding';
import { getIsBookCallOnboardingStepPending } from '@/onboarding/utils/getIsBookCallOnboardingStepPending';
import { getNextOnboardingStatus } from '@/onboarding/utils/getNextOnboardingStatus';
import { getNextPreviousOnboardingStatus } from '@/onboarding/utils/getNextPreviousOnboardingStatus';
import { type OnboardingStepHistoryEffect } from '@/onboarding/types/OnboardingStepHistoryEffect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useStore } from 'jotai';
import { useCallback } from 'react';

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
          isOnboardingAiChatEnabled && currentUser?.isWorkspaceCreator === true,
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
