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
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { getHasJustCompletedOnboarding } from '@/onboarding/utils/getHasJustCompletedOnboarding';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useCallback } from 'react';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { useStore } from 'jotai';

type GetNextOnboardingStatusArgs = {
  currentUser: CurrentUser | null;
  currentWorkspace: CurrentWorkspace | null;
  isBillingEnabled: boolean;
};

const getNextOnboardingStatus = ({
  currentUser,
  currentWorkspace,
  isBillingEnabled,
}: GetNextOnboardingStatusArgs) => {
  const isPlanRequired = getIsPlanRequired({
    isBillingEnabled,
    currentWorkspace,
  });

  if (currentUser?.onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION) {
    return OnboardingStatus.SYNC_EMAIL;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.SYNC_EMAIL) {
    return OnboardingStatus.APPS_INSTALLATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.APPS_INSTALLATION) {
    return OnboardingStatus.PROFILE_CREATION;
  }

  if (currentUser?.onboardingStatus === OnboardingStatus.PROFILE_CREATION) {
    if (currentWorkspace?.workspaceMembersCount === 1) {
      return OnboardingStatus.INVITE_TEAM;
    }
    return isPlanRequired
      ? OnboardingStatus.PLAN_REQUIRED
      : OnboardingStatus.COMPLETED;
  }
  if (currentUser?.onboardingStatus === OnboardingStatus.INVITE_TEAM) {
    return isPlanRequired
      ? OnboardingStatus.PLAN_REQUIRED
      : OnboardingStatus.COMPLETED;
  }
  return OnboardingStatus.COMPLETED;
};

export const useSetNextOnboardingStatus = () => {
  const store = useStore();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  return useCallback(() => {
    const nextOnboardingStatus = getNextOnboardingStatus({
      currentUser,
      currentWorkspace,
      isBillingEnabled,
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
    }
  }, [currentUser, currentWorkspace, isBillingEnabled, store]);
};
