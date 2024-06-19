import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { OnboardingStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { isDefined } from '~/utils/isDefined';

export const useShowAuthModal = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const onboardingStatus = useOnboardingStatus();
  const isDefaultLayoutAuthModalVisible = useRecoilValue(
    isDefaultLayoutAuthModalVisibleState,
  );
  return useMemo(() => {
    if (isMatchingLocation(AppPath.Verify)) {
      return false;
    }
    if (
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.ResetPassword)
    ) {
      return isDefaultLayoutAuthModalVisible;
    }
    if (
      isDefined(onboardingStatus) &&
      [
        OnboardingStatus.SubscriptionIncomplete,
        OnboardingStatus.UserCreation,
        OnboardingStatus.ProfileCreation,
        OnboardingStatus.WorkspaceActivation,
        OnboardingStatus.SyncEmail,
        OnboardingStatus.InviteTeam,
      ].includes(onboardingStatus)
    ) {
      return true;
    }
    if (isMatchingLocation(AppPath.PlanRequired)) {
      return (
        isDefined(onboardingStatus) &&
        [
          OnboardingStatus.CompletedWithoutSubscription,
          OnboardingStatus.SubscriptionCanceled,
        ].includes(onboardingStatus)
      );
    }
    return false;
  }, [isDefaultLayoutAuthModalVisible, isMatchingLocation, onboardingStatus]);
};
