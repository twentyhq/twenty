import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { isDefined } from '~/utils/isDefined';

export const useShowAuthModal = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const isLoggedIn = useIsLogged();
  const onboardingStatus = useOnboardingStatus();
  const subscriptionStatus = useSubscriptionStatus();

  const isDefaultLayoutAuthModalVisible = useRecoilValue(
    isDefaultLayoutAuthModalVisibleState,
  );

  return useMemo(() => {
    if (isMatchingLocation(AppPath.Verify)) {
      return false;
    }

    if (
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.ResetPassword) ||
      isMatchingLocation(AppPath.VerifyEmail) ||
      isMatchingLocation(AppPath.SignInUp)
    ) {
      return isDefaultLayoutAuthModalVisible;
    }

    if (
      !isLoggedIn ||
      onboardingStatus === OnboardingStatus.PlanRequired ||
      onboardingStatus === OnboardingStatus.ProfileCreation ||
      onboardingStatus === OnboardingStatus.WorkspaceActivation ||
      onboardingStatus === OnboardingStatus.SyncEmail ||
      onboardingStatus === OnboardingStatus.InviteTeam
    ) {
      return true;
    }

    if (isMatchingLocation(AppPath.PlanRequired)) {
      return (
        (onboardingStatus === OnboardingStatus.Completed &&
          !isDefined(subscriptionStatus)) ||
        subscriptionStatus === SubscriptionStatus.Canceled
      );
    }

    return false;
  }, [
    isLoggedIn,
    isDefaultLayoutAuthModalVisible,
    isMatchingLocation,
    onboardingStatus,
    subscriptionStatus,
  ]);
};
